import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ToastModule } from 'primeng/toast';

import { DigimonService } from '../../shared/services/digimon.service';
import { DigimonDetails } from '../../shared/dtos/digimon.dto';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { GalleriaModule } from 'primeng/galleria';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    ToastModule,
    PanelModule,
    GalleriaModule,
    DividerModule,
    TableModule,
    ImageModule,
    AccordionModule,
    ButtonModule,
    RouterLink,
  ],
  providers: [DigimonService, MessageService],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit, OnDestroy {
  digimon: DigimonDetails | null = null;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly digimonService: DigimonService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(({ id }) => this.digimonService.getDigimonDetails(id)),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Ocorreu um erro ao buscar os detalhes do Digimon. Tente novamente mais tarde.',
          });
          this.router.navigate(['/']);
          return of(null);
        })
      )
      .subscribe((digimon) => {
        this.digimon = digimon;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Detalhes do Digimon carregados com sucesso.',
        });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
