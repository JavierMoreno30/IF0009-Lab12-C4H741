import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { CharlaService, Charla, Asistente } from '../../services/charla.service';

// Validador cruzado: la fecha de fin no puede ser anterior a la de inicio
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

// Validador personalizado: el asistente debe tener 18 años o más
export const validarMayorDe18: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  if (valor === null || valor === '') {
    return null; // si está vacío, de eso se encarga Validators.required
  }
  return Number(valor) >= 18 ? null : { menorDeEdad: true };
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

  // --- Inscripción de asistentes (Lab 12) ---
  charlaSeleccionadaId: number | null = null;
  mensajeAsistente: string = '';
  errorAsistente: string = '';

  // FormGroup anidado: el grupo "asistente" vive dentro del grupo principal
  inscripcionForm = this.fb.group({
    asistente: this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      edad: [null as number | null, [Validators.required, validarMayorDe18]]
    })
  });

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
        // reset() no quita los campos extra del FormArray: lo dejamos con 1 input vacío
        this.etiquetasArray.clear();
        this.agregarEtiqueta();
      },
      error: (err) => console.error(err)
    });
  }

  // Getters para la vista
  get tituloCtrl() { return this.registroForm.get('titulo'); }
  get expositorCtrl() { return this.registroForm.get('expositor'); }
  get emailCtrl() { return this.registroForm.get('emailContacto'); }

  get etiquetasArray() {
    return this.registroForm.get('etiquetas') as FormArray;
  }

  get asistenteGroup() { return this.inscripcionForm.get('asistente') as FormGroup; }
  get nombreAsistCtrl() { return this.asistenteGroup.get('nombre'); }
  get correoAsistCtrl() { return this.asistenteGroup.get('correo'); }
  get edadAsistCtrl() { return this.asistenteGroup.get('edad'); }

  abrirInscripcion(charlaId: number | undefined): void {
    if (charlaId === undefined) { return; }
    this.charlaSeleccionadaId = charlaId;
    this.inscripcionForm.reset();
    this.mensajeAsistente = '';
    this.errorAsistente = '';
  }

  cancelarInscripcion(): void {
    this.charlaSeleccionadaId = null;
  }

  inscribirAsistente(): void {
    if (this.inscripcionForm.invalid || this.charlaSeleccionadaId === null) {
      this.inscripcionForm.markAllAsTouched();
      return;
    }

    const asistente = this.inscripcionForm.value.asistente as Asistente;

    this.charlaService.inscribirAsistente(this.charlaSeleccionadaId, asistente).subscribe({
      next: (charlaActualizada) => {
        // Reemplazamos la tarjeta vieja por la charla actualizada que devolvió el backend
        this.charlas = this.charlas.map(c => c.id === charlaActualizada.id ? charlaActualizada : c);
        this.mensajeAsistente = '¡Asistente inscrito exitosamente!';
        this.cancelarInscripcion();
      },
      error: (err) => {
        console.error(err);
        this.errorAsistente = 'No se pudo inscribir al asistente. Revise los datos.';
      }
    });
  }

  // Mutar el FormArray
  agregarEtiqueta() {
    this.etiquetasArray.push(this.fb.control('', Validators.required));
  }

  removerEtiqueta(index: number) {
    if (this.etiquetasArray.length > 1) {
      this.etiquetasArray.removeAt(index);
    }
  }
}