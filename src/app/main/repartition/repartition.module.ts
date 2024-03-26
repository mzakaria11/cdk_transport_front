import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepartitionListComponent } from './repartition-list/repartition-list.component';
import { RepartitionHistoryComponent } from './repartition-history/repartition-history.component';
import { RepartitionStatisticComponent } from './repartition-statistic/repartition-statistic.component';

import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';

import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreCommonModule } from '@core/common.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { AuthGuard } from 'app/auth/helpers';
import { RepartitionListService } from './repartition-list/repartition-list.service';
import { RepartitionHistoryService } from './repartition-history/repartition-history.service';
import { RepartitionStatisticService } from './repartition-statistic/repartition-statistic.service';
import { RepartitionDetailComponent } from './repartition-detail/repartition-detail.component';
import { RepartitionDetailService } from './repartition-detail/repartition-detail.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ColisChartComponent } from './repartition-statistic/components/colis-chart/colis-chart.component';
import { ChartComponent } from './repartition-statistic/chart/chart.component';
import { StatGridComponent } from './repartition-statistic/components/stat-grid/stat-grid.component';
import { StatArticleComponent } from './repartition-statistic/components/stat-article/stat-article.component';
import { StatRuptureComponent } from './repartition-statistic/components/stat-rupture/stat-rupture.component';

// routing
const routes: Routes = [
  {
    path: 'list',
    component: RepartitionListComponent,
    resolve: {
      rls: RepartitionListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'RepartitionListComponent' }
  },
  {
    path: 'historique',
    component: RepartitionHistoryComponent,
    resolve: {
      rhs: RepartitionHistoryService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'RepartitionHistoryComponent' }
  },
  {
    path: 'detail/:id',
    component: RepartitionDetailComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: RepartitionDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'RepartitionDetailComponent' }
  },
  {
    path: 'statistique',
    component: ChartComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: RepartitionStatisticService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.Client, Role.User], animation: 'RepartitionStatisticComponent' }
  }
];

@NgModule({
  declarations: [
    RepartitionListComponent,
    RepartitionHistoryComponent,
    RepartitionStatisticComponent,
    RepartitionDetailComponent,
    ColisChartComponent,
    ChartComponent,
    StatGridComponent,
    StatArticleComponent,
    StatRuptureComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    ContentHeaderModule,
    NgApexchartsModule
  ]
})
export class RepartitionModule { }
