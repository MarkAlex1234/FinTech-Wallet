import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { TransactionService } from "./transaction.service";
import { Injectable } from "@nestjs/common";


@Processor("transactions")
@Injectable()
export class TransactionProcessor {
  constructor(private transactionService: TransactionService) {}

  @Process("processTransfer")
  async processTransfer(job: Job<{ transactionId: string }>) {
    const { transactionId } = job.data;
    await this.transactionService.processTransfer(transactionId);
  }
}
