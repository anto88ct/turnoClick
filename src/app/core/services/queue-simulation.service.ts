import { Injectable, inject, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class QueueSimulationService implements OnDestroy {
  private mockData = inject(MockDataService);
  private sub?: Subscription;
  private tick = 0;

  start(): void {
    this.sub = interval(5000).subscribe(() => this.advance());
  }

  stop(): void {
    this.sub?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private advance(): void {
    this.tick++;
    const queue = this.mockData.queue();
    const inCorso = queue.find(b => b.status === 'in_corso');
    const nextWaiting = this.mockData.waitingQueue()[0];

    if (inCorso?.startedAt) {
      const elapsed = Date.now() - inCorso.startedAt.getTime();
      if (elapsed > 25000) {
        this.mockData.updateStatus(inCorso.id, 'completata');
      }
    } else if (!inCorso && nextWaiting) {
      this.mockData.updateStatus(nextWaiting.id, 'in_corso');
    }

    if (this.tick % 3 === 0) {
      const waitingCount = this.mockData.waitingQueue().length;
      if (waitingCount < 7 && Math.random() < 0.4) {
        this.mockData.addRandomPatient();
      }
    }
  }
}
