/* eslint-disable @typescript-eslint/no-unused-vars */
import {ObjectType, Field, Int, HideField} from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import {User} from '../../user/entities/user.entity';
import {TimestampEntites} from '../../generics/timestamp.entity';
import {ProcessorType} from '../../shared/enums/Processor-types.enum';
import {SourceTypeEnum} from '../../shared/enums/Source-Type.enum';
import {ExecutionStatusEnum} from '../../shared/enums/Execution-status.enum';

@ObjectType()
@Entity()
export class QueuedJob extends TimestampEntites {
  @Field({nullable: false})
  @PrimaryColumn()
  JobId: string;

  @Field()
  @Column()
  description: string;

  @Field((type) => ProcessorType)
  @Column({
    type: 'enum',
    enum: ProcessorType,
    default: null,
    array: false,
    nullable: true,
  })
  jobType: ProcessorType;

  @Field({nullable: true})
  @Column({nullable: true})
  sourcePath: string;

  @Field({nullable: true})
  @Column({nullable: true})
  outputPath: string;

  @Field((type) => SourceTypeEnum)
  @Column({
    type: 'enum',
    enum: SourceTypeEnum,
    default: SourceTypeEnum.FILE,
    array: false,
    nullable: true,
  })
  sourceType: SourceTypeEnum;

  @ManyToOne(() => User, (user) => user.Jobs)
  @Field((type) => User)
  owner: User;

  @Field({nullable: true})
  @Column({nullable: true})
  cronString?: string;

  @Field({nullable: true})
  @Column({nullable: true})
  startDate?: Date;

  @Field({nullable: true})
  @Column({nullable: true})
  endDate?: Date;

  @Field({nullable: true})
  @Column({nullable: true})
  lastExecutionDate: Date;

  @Field((type) => ExecutionStatusEnum, {nullable: true})
  @Column({
    type: 'enum',
    enum: ExecutionStatusEnum,
    default: null,
    array: false,
    nullable: true,
  })
  lastExecutionStatus: ExecutionStatusEnum;

  @Field({nullable: true})
  @Column({nullable: true})
  attemptsMade: number;

  @Field({nullable: true})
  @Column({nullable: true})
  failedReason: string | null;

  @Field({nullable: true})
  @Column({
    array: true,
    nullable: true,
  })
  stacktrace: string;

  @Field({nullable: true})
  @Column({nullable: true})
  finishedOn: Date;

  @Field({nullable: true})
  @Column({nullable: true})
  processedOn: Date;

  @ManyToOne((type) => QueuedJob, (job) => job.childJobs)
  @Field((type) => QueuedJob, {nullable: true})
  ancestorJob: QueuedJob;
  @OneToMany((type) => QueuedJob, (job) => job.ancestorJob)
  @Field((type) => [QueuedJob], {nullable: true})
  childJobs: QueuedJob[];

  @HideField()
  @Column({nullable: true})
  iv: string;

  @HideField()
  @Column({nullable: true})
  secret: string;
}
