import {Queue} from 'bull';
import {CryptoService} from '../../../crypto/crypto.service';
import {CreateJobInput} from '../../../scheduler/dto/create-job.input';
import {QueuedJob} from '../../../scheduler/entities/Job.entity';
import failedJobExecutor from '../../../scheduler/helpers/failed-job-executor';
import successfulJobExecutor from '../../../scheduler/helpers/successful-job-executor';
import {EncryptionJobPayload} from '../../../scheduler/interfaces/EncryptionJobPayload.interface';
import {QueueInventory} from '../../../scheduler/inventories/Queue-inventory';
import {ExecutionStatusEnum} from '../../../shared/enums/Execution-status.enum';
import {ProcessorType} from '../../../shared/enums/Processor-types.enum';
import {UserService} from '../../../user/user.service';
import {Repository} from 'typeorm';
import {v4 as uuidv4} from 'uuid';

export const createEncryptionJob = async (
  createJobInput: CreateJobInput,
  userService: UserService,
  jobRepo: Repository<QueuedJob>,
  QI: QueueInventory,
  cryptoService: CryptoService,
): Promise<QueuedJob> => {
  const user = await userService.internalFindOne(createJobInput.userId);
  const {publicKey, fingerprint} = await cryptoService.getUserKey(user);
  const Q = QI.get(createJobInput.jobType);

  const jId = uuidv4();
  const symKey = cryptoService.generateSymmetricKey();
  const iv = cryptoService.generateInitVector();
  console.log(symKey);
  const encSymKey = await cryptoService.encryptString(symKey, publicKey);
  console.log('key buffer length: ', symKey.length);
  console.log('encrypted buffer: ', encSymKey);
  const payload: EncryptionJobPayload = {
    sourcePath: createJobInput.sourcePath,
    outputPath: createJobInput.outputPath,
    ownerId: user.id,
    publicKey,
    privateKey: createJobInput.privateKey,
    signWithEncryption: createJobInput.signWithEncryption,
    cipherKey: symKey,
    cipherIV: iv,
  };
  await Q.add({...payload}, {jobId: jId});
  const startTimestamp: Date = new Date();
  const {userId, ...jobInfo} = createJobInput;
  const createdJob: QueuedJob = jobRepo.create({
    JobId: jId,
    ...jobInfo,
    lastExecutionStatus: ExecutionStatusEnum.WAITING,
    startDate: startTimestamp,
    owner: user,
    jobType: ProcessorType.ENCRYPTION,
    iv: iv.toString('hex'),
    secret: encSymKey,
  });

  await jobRepo.save(createdJob);
  successfulJobExecutor(Q, jobRepo);
  failedJobExecutor(Q, jobRepo);
  return createdJob;
};
