import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration1778524202420 implements MigrationInterface {
  name = 'TestMigration1778524202420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "poll_option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "optionText" character varying NOT NULL, "pollId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5fdd46d449ddcc8201aed9b5a1b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a1200fcfcdab6145351545f26e" ON "poll_option" ("pollId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."poll_status_enum" AS ENUM('active', 'draft', 'published', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "poll" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "status" "public"."poll_status_enum" NOT NULL DEFAULT 'active', "endsAt" TIMESTAMP WITH TIME ZONE, "createdById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03b5cf19a7f562b231c3458527e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_036ba8716c04e7e8f186d9890a" ON "poll" ("createdById") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "state" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "joinedDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vote" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "pollId" uuid NOT NULL, "optionId" uuid NOT NULL, "state" character varying NOT NULL, "votedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f5de237a438d298031d11a57c3" ON "vote" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3827d62f3c37dc8a63a13c4d0d" ON "vote" ("pollId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4ae2eb8e398ff87416da92ea28" ON "vote" ("optionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "poll_option" ADD CONSTRAINT "FK_a1200fcfcdab6145351545f26ea" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll" ADD CONSTRAINT "FK_036ba8716c04e7e8f186d9890ac" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_4ae2eb8e398ff87416da92ea286" FOREIGN KEY ("optionId") REFERENCES "poll_option"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_4ae2eb8e398ff87416da92ea286"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_3827d62f3c37dc8a63a13c4d0da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll" DROP CONSTRAINT "FK_036ba8716c04e7e8f186d9890ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll_option" DROP CONSTRAINT "FK_a1200fcfcdab6145351545f26ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4ae2eb8e398ff87416da92ea28"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3827d62f3c37dc8a63a13c4d0d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f5de237a438d298031d11a57c3"`,
    );
    await queryRunner.query(`DROP TABLE "vote"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_036ba8716c04e7e8f186d9890a"`,
    );
    await queryRunner.query(`DROP TABLE "poll"`);
    await queryRunner.query(`DROP TYPE "public"."poll_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a1200fcfcdab6145351545f26e"`,
    );
    await queryRunner.query(`DROP TABLE "poll_option"`);
  }
}
