import { Module } from '@nestjs/common';

import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';

import { KafkaProducerService } from './services/kafka-producer.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';

@Module({
  imports: [NinetwoConfigModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}

