import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as couchbase from 'couchbase';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class CouchbaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;

  constructor(private readonly configService: NinetwoConfigService) {}

  async onModuleInit() {
    const connectionString =
      this.configService.get('COUCHBASE_CONNECTION_STRING') ||
      'couchbase://localhost';
    const username =
      this.configService.get('COUCHBASE_USERNAME') || 'Administrator';
    const password = this.configService.get('COUCHBASE_PASSWORD') || 'password';
    const bucketName =
      this.configService.get('COUCHBASE_BUCKET') || 'marketing-data';

    this.cluster = await couchbase.connect(connectionString, {
      username,
      password,
    });

    this.bucket = this.cluster.bucket(bucketName);
    this.collection = this.bucket.defaultCollection();
  }

  async onModuleDestroy() {
    await this.cluster.close();
  }

  // Salvar campanha de marketing
  async saveCampaign(
    workspaceId: string,
    channelId: string,
    campaign: any,
  ): Promise<void> {
    const key = `campaign:${workspaceId}:${channelId}:${campaign.id}`;

    await this.collection.upsert(key, {
      ...campaign,
      workspaceId,
      channelId,
      updatedAt: new Date().toISOString(),
    });
  }

  // Buscar campanhas de um workspace
  async getCampaigns(workspaceId: string): Promise<any[]> {
    const query = `
      SELECT marketing.*
      FROM \`marketing-data\` AS marketing
      WHERE marketing.workspaceId = $workspaceId
      AND META(marketing).id LIKE 'campaign:%'
      ORDER BY marketing.updatedAt DESC
    `;

    const result = await this.cluster.query(query, {
      parameters: { workspaceId },
    });

    return result.rows.map((row) => row.marketing);
  }

  // Salvar sessão de analytics
  async saveAnalyticsSession(
    workspaceId: string,
    channelId: string,
    session: any,
  ): Promise<void> {
    const key = `analytics:${workspaceId}:${channelId}:${session.date}:${session.id || Date.now()}`;

    await this.collection.upsert(key, {
      ...session,
      workspaceId,
      channelId,
      updatedAt: new Date().toISOString(),
    });
  }

  // Buscar analytics de um workspace
  async getAnalytics(workspaceId: string, startDate?: string): Promise<any[]> {
    const query = `
      SELECT analytics.*
      FROM \`marketing-data\` AS analytics
      WHERE analytics.workspaceId = $workspaceId
      AND META(analytics).id LIKE 'analytics:%'
      ${startDate ? 'AND analytics.date >= $startDate' : ''}
      ORDER BY analytics.date DESC
    `;

    const result = await this.cluster.query(query, {
      parameters: startDate ? { workspaceId, startDate } : { workspaceId },
    });

    return result.rows.map((row) => row.analytics);
  }

  // Método genérico para salvar dados
  async upsert(key: string, value: any): Promise<void> {
    await this.collection.upsert(key, value);
  }

  // Método genérico para buscar dados
  async get(key: string): Promise<any> {
    const result = await this.collection.get(key);

    return result.content;
  }

  // Query genérica N1QL
  async query(queryString: string, parameters?: any): Promise<any[]> {
    const result = await this.cluster.query(queryString, { parameters });

    return result.rows;
  }
}

