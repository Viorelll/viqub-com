import { Component } from '@angular/core';
import { StatisticsComponent } from './shared-components/statistics/statistics.component';
import { HeaderComponent } from './shared-components/header/header.component';
import { MostPopularComponent } from './shared-components/most-popular/most-popular.component';
import { RecommendedComponent } from './shared-components/recommended/recommended.component';
import { FooterComponent } from './shared-components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    StatisticsComponent,
    MostPopularComponent,
    RecommendedComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Viqub';
}
