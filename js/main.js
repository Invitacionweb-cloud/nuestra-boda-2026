/*
 * ============================================================
 * LÓGICA PRINCIPAL DE LA INVITACIÓN DE BODA
 * ============================================================
 * Este archivo gestiona:
 *   1. La animación de apertura del sobre virtual.
 *   2. La reproducción y control del audio de fondo.
 *   3. El scroll automático al contenido principal.
 *   4. El botón flotante Play/Pause de música.
 *   5. Las animaciones fade-in al hacer scroll (Intersection Observer).
 * ============================================================
 */

(function () {
    'use strict';

    /* ===== REFERENCIAS A ELEMENTOS DEL DOM ===== */
    const sobreOverlay      = document.getElementById('sobre-overlay');
    const btnAbrir          = document.getElementById('btn-abrir');
    const contenidoPrincipal = document.getElementById('contenido-principal');
    const audioBoda         = document.getElementById('audio-boda');
    const btnMusica         = document.getElementById('btn-musica');
    const seccionesFade     = document.querySelectorAll('.fade-in-observer');

    /* ===== VERIFICACIÓN DE ELEMENTOS CRÍTICOS ===== */
    if (!sobreOverlay || !btnAbrir || !contenidoPrincipal || !audioBoda) {
        console.warn('Error: Faltan elementos esenciales en el DOM. Revisa el HTML.');
        return;
    }

    /* ===== ESTADO DE LA APLICACIÓN ===== */
    let invitacionAbierta = false;
    let musicaReproduciendo = false;

    /* =========================================================
     * FUNCIÓN: ABRIR INVITACIÓN
     * - Activa la animación del sobre (clase CSS 'abierto').
     * - Reproduce el audio.
     * - Revela el contenido principal con un pequeño retardo.
     * - Oculta el overlay del sobre tras la animación.
     * - Muestra el botón flotante de música.
     * ========================================================= */
    function abrirInvitacion() {
        if (invitacionAbierta) return; // Evita doble ejecución
        invitacionAbierta = true;

        // 1. Añadir clase para animar la solapa del sobre
        sobreOverlay.classList.add('abierto');

        // 2. Intentar reproducir el audio
        reproducirAudio();

        // 3. Revelar el contenido principal
        contenidoPrincipal.classList.add('visible');

        // 4. Tras la animación de la solapa (~700ms), ocultar el overlay
        setTimeout(function () {
            sobreOverlay.classList.add('oculto');

            // 5. Mostrar el botón flotante de música
            btnMusica.classList.add('visible');

            // 6. Hacer scroll suave al contenido principal
            setTimeout(function () {
                const heroSection = document.getElementById('seccion-hero');
                if (heroSection) {
                    heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }, 750);
    }

    /* =========================================================
     * FUNCIÓN: REPRODUCIR AUDIO
     * ========================================================= */
    function reproducirAudio() {
        // Reiniciar el audio por si ya se había reproducido antes
        audioBoda.currentTime = 0;

        // Intentar reproducción con manejo de promesa (navegadores modernos)
        const promesaReproduccion = audioBoda.play();

        if (promesaReproduccion !== undefined) {
            promesaReproduccion
                .then(function () {
                    musicaReproduciendo = true;
                    actualizarIconoMusica();
                })
                .catch(function (error) {
                    console.warn('La reproducción automática fue bloqueada por el navegador:', error.message);
                    musicaReproduciendo = false;
                    actualizarIconoMusica();
                });
        }
    }

    /* =========================================================
     * FUNCIÓN: ALTERNAR PLAY/PAUSE DE LA MÚSICA
     * ========================================================= */
    function toggleMusica() {
        if (musicaReproduciendo) {
            audioBoda.pause();
            musicaReproduciendo = false;
        } else {
            const promesaReproduccion = audioBoda.play();
            if (promesaReproduccion !== undefined) {
                promesaReproduccion
                    .then(function () {
                        musicaReproduciendo = true;
                        actualizarIconoMusica();
                    })
                    .catch(function (error) {
                        console.warn('No se pudo reanudar la reproducción:', error.message);
                        musicaReproduciendo = false;
                        actualizarIconoMusica();
                    });
            }
        }
        actualizarIconoMusica();
    }

    /* =========================================================
     * FUNCIÓN: ACTUALIZAR ICONO Y ESTADO VISUAL DEL BOTÓN
     * ========================================================= */
    function actualizarIconoMusica() {
        const icono = btnMusica.querySelector('.icono-musica');
        if (!icono) return;

        if (musicaReproduciendo) {
            icono.textContent = '🎵';
            btnMusica.classList.add('reproduciendo');
            btnMusica.setAttribute('aria-label', 'Pausar música');
            btnMusica.setAttribute('title', 'Pausar música');
        } else {
            icono.textContent = '🔇';
            btnMusica.classList.remove('reproduciendo');
            btnMusica.setAttribute('aria-label', 'Reproducir música');
            btnMusica.setAttribute('title', 'Reproducir música');
        }
    }

    /* =========================================================
     * INTERSECTION OBSERVER: ANIMACIONES FADE-IN AL SCROLL
     * ========================================================= */
    function inicializarFadeInObserver() {
        // Verificar soporte del navegador
        if (!('IntersectionObserver' in window)) {
            // Fallback: mostrar todas las secciones inmediatamente
            seccionesFade.forEach(function (seccion) {
                seccion.classList.add('visible');
            });
            return;
        }

        const opcionesObserver = {
            root: null,           // viewport del navegador
            rootMargin: '0px 0px -60px 0px', // Dispara 60px antes de que el elemento entre
            threshold: 0.1       // Basta con que el 10% del elemento sea visible
        };

        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    // Dejar de observar una vez que ya apareció
                    observer.unobserve(entrada.target);
                }
            });
        }, opcionesObserver);

        // Observar cada sección con la clase fade-in-observer
        seccionesFade.forEach(function (seccion) {
            observer.observe(seccion);
        });
    }

    /* =========================================================
     * EVENT LISTENERS
     * ========================================================= */

    // Clic en el botón "Abrir Invitación"
    btnAbrir.addEventListener('click', abrirInvitacion);

    // Clic en el botón flotante de música (Play/Pause)
    btnMusica.addEventListener('click', toggleMusica);

    // Escuchar eventos del elemento de audio para sincronizar estado
    audioBoda.addEventListener('play', function () {
        musicaReproduciendo = true;
        actualizarIconoMusica();
    });

    audioBoda.addEventListener('pause', function () {
        musicaReproduciendo = false;
        actualizarIconoMusica();
    });

    audioBoda.addEventListener('ended', function () {
        musicaReproduciendo = false;
        actualizarIconoMusica();
    });

    // Permitir también abrir con tecla Enter o Espacio sobre el botón del sobre
    btnAbrir.addEventListener('keydown', function (evento) {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            abrirInvitacion();
        }
    });

    /* =========================================================
     * INICIALIZACIÓN AL CARGAR LA PÁGINA
     * ========================================================= */
    function inicializar() {
        // Inicializar el observer para fade-ins
        inicializarFadeInObserver();

        // Asegurar que el contenido esté oculto al cargar
        contenidoPrincipal.classList.remove('visible');
        sobreOverlay.classList.remove('oculto', 'abierto');
        btnMusica.classList.remove('visible', 'reproduciendo');
        musicaReproduciendo = false;
        actualizarIconoMusica();
    }

    // Ejecutar inicialización cuando el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

})();