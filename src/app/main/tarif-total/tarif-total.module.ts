import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TaxeListComponent} from "../taxe/taxe-list/taxe-list.component";
import {Role} from "../../auth/models";
import {RouterModule, Routes} from "@angular/router";
import {TarifTotalCalculeComponent} from "./tarif-total-calcule/tarif-total-calcule.component";
import {FormsModule} from "@angular/forms";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CoreCommonModule} from "../../../@core/common.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {Ng2FlatpickrModule} from "ng2-flatpickr";
import {CorePipesModule} from "../../../@core/pipes/pipes.module";
import {CoreDirectivesModule} from "../../../@core/directives/directives";
import {CoreSidebarModule} from "../../../@core/components";
import {ContentHeaderModule} from "../../layout/components/content-header/content-header.module";
import {FileUploadModule} from "ng2-file-upload";

const routes: Routes = [
{
  path: 'list/:id',
    component: TarifTotalCalculeComponent,
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TarifTotalCalculeComponent' }
}

]

@NgModule({
  declarations: [
      TarifTotalCalculeComponent
  ],
  imports: [
    FormsModule,
    NgbModule,
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
    FileUploadModule

  ]
})
export class TarifTotalModule { }
