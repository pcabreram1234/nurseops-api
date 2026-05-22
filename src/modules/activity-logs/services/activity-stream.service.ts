import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ActivityStreamService {
    private readonly activitySubject = new Subject<any>();

    emitLiveActivity(log: any): void {
        this.activitySubject.next(log);
    }

    getLiveStream(): Observable<{ data: any }> {
        return this.activitySubject.asObservable().pipe(
            map((activity) => ({ data: activity })),
        );
    }
}