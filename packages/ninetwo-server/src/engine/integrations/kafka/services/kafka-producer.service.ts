import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: NinetwoConfigService) {
    const brokers = this.configService.get('KAFKA_BROKERS')?.split(',') || [
      'localhost:29092',
    ];

    this.kafka = new Kafka({
      clientId: 'ninetwo-producer',
      brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMarketingCampaign(data: {
    workspaceId: string;
    channelId: string;
    campaignData: any;
  }) {
    await this.producer.send({
      topic: 'marketing-campaigns',
      messages: [
        {
          key: data.channelId,
          value: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  }

  async sendAnalyticsSession(data: {
    workspaceId: string;
    channelId: string;
    sessionData: any;
  }) {
    await this.producer.send({
      topic: 'analytics-sessions',
      messages: [
        {
          key: data.channelId,
          value: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  }

  // Método genérico para enviar qualquer evento
  async send(topic: string, key: string, value: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });
  }
}

