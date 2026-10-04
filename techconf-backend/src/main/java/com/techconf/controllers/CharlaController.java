package com.techconf.controllers;

import com.techconf.models.Charla;
import com.techconf.repositories.CharlaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.techconf.models.Asistente;
import java.util.List;

@RestController
@RequestMapping("/api/charlas")
@CrossOrigin(origins = "http://localhost:4200")
public class CharlaController {

    @Autowired
    private CharlaRepository repository;

    @GetMapping
    public List<Charla> obtenerTodas() {
        return repository.findAll();
    }

    @PostMapping
    public Charla registrarCharla(@RequestBody Charla nuevaCharla) {
        return repository.save(nuevaCharla);
    }
    @PostMapping("/{id}/asistentes")
public ResponseEntity<Charla> inscribirAsistente(@PathVariable Long id,
                                                 @Valid @RequestBody Asistente asistente) {
    return repository.findById(id)
            .map(charla -> {
                asistente.setCharla(charla);               // lado dueño de la relación
                charla.getAsistentes().add(asistente);     // lado inverso, para mantener coherencia
                return ResponseEntity.ok(repository.save(charla));
            })
            .orElse(ResponseEntity.notFound().build());
}
}
