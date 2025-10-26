import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Controller('debug')
export class DebugMetadataController {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  @Get('marketing-metadata')
  async getMarketingMetadata() {
    const marketingObjects = await this.objectMetadataRepository.find({
      where: [
        { nameSingular: 'adsCampaign' },
        { nameSingular: 'analyticsData' },
        { nameSingular: 'marketingChannel' },
        { nameSingular: 'marketingDashboard' },
      ],
      order: { nameSingular: 'ASC' },
    });

    return {
      total: marketingObjects.length,
      objects: marketingObjects.map((obj) => ({
        id: obj.id,
        nameSingular: obj.nameSingular,
        namePlural: obj.namePlural,
        labelSingular: obj.labelSingular,
        isSystem: obj.isSystem,
        isActive: obj.isActive,
        workspaceId: obj.workspaceId,
      })),
    };
  }
}

