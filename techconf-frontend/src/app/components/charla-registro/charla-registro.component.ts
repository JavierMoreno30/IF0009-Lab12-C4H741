import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormArray, Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { CharlaService, Charla } from '../../services/charla.service';

//validador cruzado: la fecha de fin no puede ser anterior a la de inicio
export const validarRangoFechas: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const inicio = control.get('fechaInicio')?.value;
  const fin = control.get('fechaFin')?.value;

  if (inicio && fin) {
    const dInicio = new Date(inicio);
    const dFin = new Date(fin);
    if (dFin < dInicio) {
      return { fechasInvalidas: true };
    }
  }
  return null;
};

@Component({
  selector: 'app-charla-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './charla-registro.component.html',
  styleUrl: './charla-registro.component.css'
})
export class CharlaRegistroComponent implements OnInit {
  private charlaService = inject(CharlaService);
  private fb = inject(FormBuilder);
  charlas: Charla[] = [];
  mensajeExito: string = '';

  registroForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    expositor: ['', [Validators.required]],
    nivel: ['Principiante', [Validators.required]],
    emailContacto: ['', [Validators.required, Validators.email]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    etiquetas: this.fb.array([
      this.fb.control('', Validators.required)
    ])
  }, { validators: validarRangoFechas });

  ngOnInit(): void {
    this.cargarCharlas();
  }

  cargarCharlas() {
    this.charlaService.getCharlas().subscribe({
      next: (data) => this.charlas = data,
      error: (err) => console.error('Error al cargar las charlas', err)
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const nuevaCharla: Charla = this.registroForm.value as Charla;

    this.charlaService.registrarCharla(nuevaCharla).subscribe({
      next: (res) => {
        this.mensajeExito = '¡Charla registrada exitosamente!';
        this.charlas.push(res);
        this.registroForm.reset({ nivel: 'Principiante' });
        //reset() no quita los campos extra del FormArray: lo dejamos con 1 input vacío
        this.etiquetasArray.clear();
        this.agregarEtiqueta();
      },
      error: (err) => console.error(err)
    });
  }

  //getters para la vista
  get tituloCtrl() { return this.registroForm.get('titulo'); }
  get expositorCtrl() { return this.registroForm.get('expositor'); }
  get emailCtrl() { return this.registroForm.get('emailContacto'); }

  get etiquetasArray() {
    return this.registroForm.get('etiquetas') as FormArray;
  }

  //mutar el FormArray
  agregarEtiqueta() {
    this.etiquetasArray.push(this.fb.control('', Validators.required));
  }

  removerEtiqueta(index: number) {
    if (this.etiquetasArray.length > 1) {
      this.etiquetasArray.removeAt(index);
    }
  }
}