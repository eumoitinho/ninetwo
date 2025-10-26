import { MigrationInterface, QueryRunner } from "typeorm";

export class MarketingModuleFields1761454639656 implements MigrationInterface {
    name = 'MarketingModuleFields1761454639656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`);
        await queryRunner.query(`ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'en'`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'en'`);
    }

}
