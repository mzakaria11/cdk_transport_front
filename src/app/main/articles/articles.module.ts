import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/auth/helpers';
import { Role } from 'app/auth/models';

// routing
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./article/article.module').then(m => m.ArticleModule),
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]

})
export class ArticlesModule { }
