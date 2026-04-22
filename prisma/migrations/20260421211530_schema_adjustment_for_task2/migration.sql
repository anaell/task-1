/*
  Warnings:

  - You are about to drop the column `sample_size` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `gender_probability` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `country_id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.
  - You are about to alter the column `country_probability` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - Added the required column `country_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gender` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `age_group` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('child', 'teenager', 'adult', 'senior');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sample_size",
ADD COLUMN     "country_name" TEXT NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL,
ALTER COLUMN "gender_probability" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "age_group",
ADD COLUMN     "age_group" "AgeGroup" NOT NULL,
ALTER COLUMN "country_id" SET DATA TYPE VARCHAR(2),
ALTER COLUMN "country_probability" SET DATA TYPE DOUBLE PRECISION;
