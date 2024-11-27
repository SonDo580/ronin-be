import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1732727343078 implements MigrationInterface {
    name = 'InitialMigration1732727343078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seat_availability" ("flight_id" integer NOT NULL, "seat_code" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "status" smallint NOT NULL DEFAULT '0', "version" bigint NOT NULL DEFAULT '0', CONSTRAINT "PK_dea36e2853aaa895c3f017c646f" PRIMARY KEY ("flight_id", "seat_code"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" SERIAL NOT NULL, "total_amount" numeric(10,2) NOT NULL, "checkout_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "seat_availability"`);
    }

}
