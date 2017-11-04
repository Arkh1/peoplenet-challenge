import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class LegendDataSource extends DataSource<any> {
  data: Array<any> = [
    {character: 'A', component: 'Start'},
    {character: 'B', component: 'Exit'},
    {character: '#', component: 'Wall'},
    {character: '.', component: 'Path'}
  ];

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Array<any>> {
    return Observable.of(this.data);
  }

  disconnect() {}
}
