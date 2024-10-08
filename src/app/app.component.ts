import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, finalize, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { HeaderComponent } from './shared/components/header/header.component';
import { DigimonService } from './shared/services/digimon.service';
import { DigimonList } from './dtos/digimon-list.dto';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ImageModule,
    PaginatorModule,
    HeaderComponent,
  ],
  providers: [DigimonService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  loading = false;

  page: number = 0;
  first: number = 0;
  pageSize: number = 20;
  totalRecords: number = 0;

  digimons: DigimonList | null = null;
  form!: FormGroup;

  private readonly unsubscribe$ = new Subject<void>();
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly digimonService: DigimonService
  ) {}

  ngOnInit() {
    this.configForm();
    this.loadDigimons();
  }

  configForm() {
    this.form = this.formBuilder.group({
      search: [''],
    });

    this.form
      .get('search')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((search) => {
        this.loading = true;
        if (search) {
          this.digimonService
            .search(search)
            .pipe(
              finalize(() => {
                this.loading = false;
              }),
              takeUntil(this.unsubscribe$)
            )
            .subscribe((digimons) => {
              this.digimons = digimons;
              this.totalRecords = digimons.content.length;
              this.page = digimons.pageable.currentPage;
              this.first = 0;
            });
        } else {
          this.loadDigimons();
        }
      });
  }

  loadDigimons() {
    this.loading = true;
    this.digimonService
      .getDigimonList({
        page: this.page,
        pageSize: this.pageSize,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        catchError((error) => {
          return [];
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((digimons) => {
        this.digimons = digimons;

        this.digimons = digimons;
        this.totalRecords = digimons.pageable.totalElements;
        this.page = digimons.pageable.currentPage;
        this.first = 0;
        console.log(digimons);
      });
  }

  onPageChange(event: PaginatorState) {
    this.page = event.page ?? 0;
    this.pageSize = event.rows ?? 20;
    this.totalRecords = event.rows ?? 0;
    this.loadDigimons();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
