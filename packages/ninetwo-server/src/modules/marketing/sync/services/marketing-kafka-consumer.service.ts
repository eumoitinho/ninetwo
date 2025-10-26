import { Injectable, OnModuleInit } from '@nestjs/common';

import { CouchbaseService } from 'src/engine/integrations/couchbase/services/couchbase.service';
import { KafkaConsumerService } from 'src/engine/integrations/kafka/services/kafka-consumer.service';

@Injectable()
export class MarketingKafkaConsumerService implements OnModuleInit {
  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly couchbase: CouchbaseService,
  ) {}

  onModuleInit() {
    // Registrar handler para campanhas
    this.kafkaConsumer.registerHandler(
      'marketing-campaigns',
      this.handleCampaign.bind(this),
    );

    // Registrar handler para analytics
    this.kafkaConsumer.registerHandler(
      'analytics-sessions',
      this.handleAnalytics.bind(this),
    );
  }

  private async handleCampaign(message: any) {
    const { workspaceId, channelId, campaignData } = message;

    // Salvar no Couchbase
    await this.couchbase.saveCampaign(workspaceId, channelId, campaignData);

    console.log(
      `✅ Campaign saved to Couchbase: ${campaignData.id || campaignData.name}`,
    );
  }

  private async handleAnalytics(message: any) {
    const { workspaceId, channelId, sessionData } = message;

    // Salvar no Couchbase
    await this.couchbase.saveAnalyticsSession(
      workspaceId,
      channelId,
      sessionData,
    );

    console.log(
      `✅ Analytics session saved to Couchbase for channel: ${channelId}`,
    );
  }
}

