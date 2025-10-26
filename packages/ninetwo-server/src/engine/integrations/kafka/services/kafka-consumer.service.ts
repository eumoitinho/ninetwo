import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private messageHandlers: Map<string, (message: any) => Promise<void>> =
    new Map();

  constructor(private readonly configService: NinetwoConfigService) {
    const brokers = this.configService.get('KAFKA_BROKERS')?.split(',') || [
      'localhost:29092',
    ];

    this.kafka = new Kafka({
      clientId: 'ninetwo-consumer',
      brokers,
    });

    this.consumer = this.kafka.consumer({
      groupId: 'ninetwo-marketing-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.setupConsumers();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  // Registrar handler para um tópico específico
  registerHandler(topic: string, handler: (message: any) => Promise<void>) {
    this.messageHandlers.set(topic, handler);
  }

  private async setupConsumers() {
    // Subscribe aos topics
    const topics = ['marketing-campaigns', 'analytics-sessions'];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    // Processar mensagens
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const handler = this.messageHandlers.get(topic);

        if (handler && message.value) {
          try {
            const data = JSON.parse(message.value.toString());

            await handler(data);
          } catch (error) {
            console.error(
              `Error processing message from ${topic}:`,
              error,
              message.value?.toString(),
            );
          }
        }
      },
    });
  }
}

