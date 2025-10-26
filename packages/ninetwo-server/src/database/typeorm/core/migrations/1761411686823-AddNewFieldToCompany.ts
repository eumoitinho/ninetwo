import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldToCompany1761411686823 implements MigrationInterface {
    name = 'AddNewFieldToCompany1761411686823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`);
        await queryRunner.query(`ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'en'`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ALTER COLUMN "locale" SET DEFAULT 'en'`);
    }

}
