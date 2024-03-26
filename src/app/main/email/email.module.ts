import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuillModule } from 'ngx-quill';

import { EmailComposeComponent } from './email-compose/email-compose.component';
import { EmailDetailsComponent } from './email-detail/email-detail.component';
import { EmailListComponent } from './email-list/email-list.component';
import { EmailListItemComponent } from './email-list/email-list-item/email-list-item.component';

import { EmailComponent } from './email.component';
import { EmailService } from './email.service';

const routes: Routes = [
  {
    path: ':folder',
    component: EmailComponent,
    resolve: {
      email: EmailService
    },
    data: { animation: 'EmailComponent' }
  },
  {
    path: 'label/:label',
    component: EmailComponent,
    resolve: {
      email: EmailService
    },
    data: { animation: 'EmailComponent' }
  },
  {
    path: '**',
    redirectTo: 'inbox',
    data: { animation: 'EmailComponent' }
  }
];

@NgModule({
  declarations: [
    EmailComponent,
    EmailComposeComponent,
    EmailDetailsComponent,
    EmailListComponent,
    EmailListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule,
    CoreCommonModule,
    NgbModule,
    NgSelectModule,
    QuillModule.forRoot(),
    CorePipesModule,
    CoreSidebarModule
  ],
  providers: [EmailService]
})
export class EmailModule { }
