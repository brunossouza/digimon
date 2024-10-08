import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DigimonService } from '../../shared/services/digimon.service';
import { DigimonList } from '../../shared/dtos/digimon-list.dto';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
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
    RouterLink,
  ],
  providers: [DigimonService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = false;

  page: number = 0;
  first: number = 0;
  pageSize: number = 20;
  totalRecords: number = 0;
  isSearching: boolean = false;

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
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        switchMap((search) => {
          this.loading = true;
          this.isSearching = !!search;
          return search
            ? this.digimonService.search(search)
            : this.digimonService.getDigimonList({
                page: this.page,
                pageSize: this.pageSize,
              });
        }),
        finalize(() => {
          this.loading = false;
        }),
        catchError((error) => {
          return [];
        })
      )
      .subscribe((digimons) => {
        this.updateDigimonList(digimons);
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
        this.updateDigimonList(digimons);
      });
  }

  updateDigimonList(digimons: DigimonList) {
    this.digimons = digimons;
    this.totalRecords = this.isSearching
      ? digimons.content.length
      : digimons.pageable.totalElements;
    this.page = digimons.pageable.currentPage;
    this.first = 0;
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
