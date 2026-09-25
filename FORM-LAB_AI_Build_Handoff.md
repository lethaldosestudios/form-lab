# FORM//LAB --- AI Build Handoff Specification

## Project Identity

**Product name:** FORM//LAB\
**Concept:** A fictional industrial materialization machine that
transforms 2D silhouettes into soft-inflated 3D rendered objects.

FORM//LAB should not feel like a conventional AI image generator with a
retro skin. The entire interface is a **virtual physical machine**.
Users operate controls, watch the machine materialize their object
through a curved CRT display, and then scroll down to physically
"retrieve" the finished object from a vending-machine-style dispenser.

### Core fantasy

> **INPUT → CONFIGURE → MATERIALIZE → INSPECT → DISPENSE**

The user should feel like they are operating a specialized piece of
late-1990s/early-2000s experimental industrial equipment.

------------------------------------------------------------------------

# 1. Design Direction

## Primary aesthetic: Skeuomorphic Industrial Futurism

The visual language should combine:

-   Heavy industrial machine chassis
-   Convex CRT glass
-   Dark painted metal
-   Brushed metal details
-   Physical knobs
-   Mechanical switches
-   Sliders
-   Push buttons
-   Analog gauges
-   Incandescent indicator bulbs
-   Engraved/printed technical labels
-   Screws, seams, vents, panel breaks
-   Smoked glass
-   Subtle wear and manufacturing details
-   Modern typography and layout discipline
-   High-quality 3D rendered objects inside the machine

### Avoid

Do **not** turn the interface into:

-   A generic dashboard
-   A generic AI image generator
-   A fake Windows 95 interface
-   A VHS/pixel-art website
-   An overly neon cyberpunk UI
-   A cockpit overloaded with controls
-   A collection of unrelated retro effects

The machine should look complicated and believable while remaining easy
to operate.

------------------------------------------------------------------------

# 2. Brand

## FORM//LAB

Suggested fictional manufacturer identity:

**FORM//LAB**\
**MODEL: IM-01**\
**INFLATION & MATERIALIZATION UNIT**

Optional technical markings:

-   TYPE: 3D-FAB
-   INPUT: 2D VECTOR / RASTER
-   OUTPUT: INFLATED FORM
-   REV: 0.9.x
-   SYSTEM STATUS: READY

These markings should feel like industrial labeling rather than
decorative UI copy.

------------------------------------------------------------------------

# 3. Product Concept

The application takes a 2D silhouette/reference image and produces a 3D
soft-inflated version while preserving the original recognizable shape.

Primary user controls include:

-   Reference geometry
-   Shape description
-   Material preset
-   Material color
-   Material transparency
-   Puffiness
-   Fold density
-   Asymmetry
-   Gloss/sheen
-   Background
-   Lighting
-   Optional shadows
-   Generation/render controls

The generated result is displayed inside the machine's large curved CRT
display.

After successful generation, the user is prompted to scroll downward to
the machine's lower dispensing compartment where the finished object can
be "retrieved."

------------------------------------------------------------------------

# 4. Overall Machine Architecture

The page should visually read as one large physical machine.

## Upper section --- Control / Display Deck

Contains:

1.  FORM//LAB branding
2.  Reference input
3.  Material controls
4.  Inflation controls
5.  Scene/background controls
6.  Status indicators
7.  Main CRT display
8.  Materialize button

## Lower section --- Fabrication / Dispenser

Contains:

1.  Fabrication status
2.  Machine status indicators
3.  Retrieval compartment
4.  Finished object
5.  Retrieve Object button
6.  Export/download actions

The user should move down the machine through normal page scrolling.

------------------------------------------------------------------------

# 5. CRT Display

The CRT is the central visual element.

## Physical appearance

The display should look like actual thick curved glass:

-   Convex/bulging screen
-   Dark thick bezel
-   Recessed into the machine chassis
-   Glass reflections
-   Subtle edge distortion
-   Slight vignette
-   Faint internal glow
-   Very subtle scanlines
-   Optional subtle screen noise
-   Tiny chromatic aberration only if tasteful
-   Physical screws or fasteners around the bezel
-   Dark plastic/metal housing

Do not overdo CRT effects. The rendered object must remain clear.

## CRT purpose

The CRT is not merely an output canvas.

It is the machine's central communication surface.

It should display different states throughout the workflow.

### Initial state

Example:

``` text
FORM//LAB
INFLATION & MATERIALIZATION SYSTEM

AWAITING REFERENCE GEOMETRY

DROP A SILHOUETTE TO BEGIN

SYSTEM: READY
```

### Reference loaded

``` text
REFERENCE LOCKED

GEOMETRY DETECTED
NEGATIVE SPACE: 03
BOUNDARY COMPLEXITY: LOW

READY TO INFLATE
```

### Parameter editing

The CRT can display a live visual approximation of the current
object/material state.

### Material selection

Display selected material and a visual sample.

### Generation

Display processing state and animation.

### Completed render

Display the actual generated 3D object.

### Completed state

``` text
OBJECT COMPLETE

MATERIAL: SOFT VINYL
PUFFINESS: 82%
GLOSS: 74%

OBJECT READY

↓ SCROLL TO DISPENSE ↓
```

------------------------------------------------------------------------

# 6. Machine Controls

Controls should use physical metaphors based on their function.

## Rotary knobs

Use for continuous parameters:

-   Puffiness
-   Gloss/Sheen
-   Asymmetry
-   Potentially fold density

Knobs should rotate as the user interacts with them.

The interaction should feel physical:

-   Drag vertically to change value
-   Visual rotation
-   Numeric value updates
-   Optional tick marks
-   Subtle mechanical easing

## Toggle switches

Use for binary settings:

-   Interior Cutouts
-   Live Preview
-   Auto Generate
-   Optional shadows

## Rotary selectors

Use for discrete options:

-   Material
-   Background mode
-   Transparency

Example material selector:

``` text
PLASTIC → RUBBER → SILICONE → GEL → CHROME
```

## Push buttons

Use for important actions:

-   MATERIALIZE
-   RETRIEVE
-   EXPORT
-   RESET

Primary buttons should look physically pressable.

------------------------------------------------------------------------

# 7. Indicator Lights

Indicator bulbs should communicate machine state.

Suggested indicators:

-   POWER
-   REFERENCE
-   MATERIAL
-   INFLATION
-   PROCESSING
-   READY
-   DISPENSE

States:

### Inactive

Dark glass bulb.

### Active

Illuminated bulb with subtle bloom.

### Processing

Pulsing indicator.

### Complete

Steady illuminated indicator.

Example:

``` text
POWER       ●
REFERENCE   ●
MATERIAL    ●
INFLATION   ●
PROCESSING  ◉
READY       ○
```

After rendering:

``` text
POWER       ●
REFERENCE   ●
MATERIAL    ●
INFLATION   ●
PROCESSING  ●
READY       ◉
DISPENSE    ◉
```

Indicator colors should have functional meaning, not random decoration.

------------------------------------------------------------------------

# 8. Analog Gauges

Use a small number of physical gauges.

Potential gauges:

-   AIR PRESSURE
-   SURFACE TENSION
-   REFLECTION

Do not create a gauge for every parameter.

A gauge should have a believable physical purpose.

Example:

``` text
        AIR PRESSURE

             ╱
           ╱
         ╱
       ╱
──────●────────────
 LOW            MAX
```

Puffiness can map naturally to AIR PRESSURE.

------------------------------------------------------------------------

# 9. Reference Input

The reference image should feel like a physical input medium.

Possible metaphor:

**REFERENCE FILM**

The uploaded silhouette appears as a transparency/film card.

Example:

``` text
REFERENCE FILM

┌──────────────────────┐
│                      │
│        SILHOUETTE    │
│                      │
│       SHAPE-042      │
│                      │
└──────────────────────┘

[ INSERT ]
```

After upload:

-   Show thumbnail
-   Show detected shape
-   Allow replacement
-   Allow reset
-   Indicate successful reference detection

The original silhouette should remain visually distinguishable from the
generated result.

------------------------------------------------------------------------

# 10. Material Presets

Material presets are a major part of the experience.

Potential presets:

-   Soft Plastic
-   Candy
-   Toy
-   Vinyl
-   Rubber
-   Silicone
-   Jelly
-   Chrome
-   Gloss Plastic
-   Translucent Plastic

Presets should automatically configure relevant parameters but remain
editable.

A preset should feel like a physical material cartridge or module.

Optional metaphor:

``` text
MATERIAL CARTRIDGE

[ VINYL-07 ]

[ INSERT MATERIAL ]
```

Selecting a preset can animate the cartridge into the machine.

Do not make the animation mandatory every time if it becomes slow or
repetitive.

------------------------------------------------------------------------

# 11. Material Color

Material color should be visually prominent but compact.

Recommended structure:

``` text
MATERIAL COLOR

[ COLOR SWATCH ] #FF4500

RECENT
● ● ● ● ●

PRESETS
FLAME  LIME  CYAN  VIOLET  WHITE  BLACK
```

Color selection should immediately affect any available live preview.

------------------------------------------------------------------------

# 12. Transparency

Supported modes:

-   Opaque
-   Translucent
-   Clear

Treat transparency as a material property rather than a generic
technical setting.

Possible future advanced controls:

-   Refraction
-   Transmission
-   Internal glow

Only expose advanced controls when relevant to the selected transparency
mode.

------------------------------------------------------------------------

# 13. Inflation Controls

Core controls:

### Puffiness

Creative labels:

`FLAT → PUFFED`

Physical metaphor:

**AIR PRESSURE**

### Asymmetry

Creative labels:

`PERFECT → ORGANIC`

Physical metaphor:

**DEFORMATION**

### Fold Density

Possible label:

**SURFACE DETAIL**

or:

**CREASE DENSITY**

### Gloss / Sheen

Creative labels:

`MATTE → GLOSSY`

Physical metaphor:

**SURFACE REFLECTION**

Terminology should describe the visible result rather than
implementation details wherever possible.

------------------------------------------------------------------------

# 14. Live Preview

Live preview should be implemented in two layers.

## Layer 1 --- Immediate local visual feedback

Do not generate a new AI render for every slider movement.

Instead:

``` text
control change
↓
local visual update
↓
60fps / responsive interaction
```

The local preview can visually communicate:

-   Puffiness
-   Gloss
-   Asymmetry
-   Material color
-   Basic material changes

This should remain responsive.

## Layer 2 --- Debounced AI generation

When Live Preview is enabled:

``` text
parameter changes
↓
wait ~1.5–2 seconds after the user stops changing controls
↓
send latest parameters
↓
generate/render
↓
replace CRT result
```

Never queue a generation request for every tiny slider movement.

Cancel or supersede outdated requests where technically possible.

Provide a Live Preview toggle so users can choose between responsive
automatic generation and manual generation.

------------------------------------------------------------------------

# 15. Generation Experience

The primary action should be something stronger than "Generate Shape."

Recommended label:

**MATERIALIZE**

Possible alternatives:

-   MATERIALIZE OBJECT
-   START FABRICATION
-   INFLATE
-   FABRICATE

The button should be physically large and pressable.

Interaction:

1.  User presses button.
2.  Button depresses.
3.  Machine status changes.
4.  Indicator bulbs activate.
5.  CRT flickers/animates.
6.  Generation begins.
7.  Result resolves inside CRT.
8.  READY indicator activates.
9.  DISPENSE indicator activates.
10. User receives a prompt to scroll down.

------------------------------------------------------------------------

# 16. Generation Animation

Use motion intentionally.

Suggested sequence:

``` text
READY
↓
PROCESSING
↓
GEOMETRY
↓
INFLATING
↓
MATERIALIZING
↓
RENDERING
↓
OBJECT READY
```

Possible CRT effects:

-   Pixel/mosaic reveal
-   Scanline sweep
-   Screen flicker
-   Subtle distortion
-   Object gradually resolving
-   Material highlight appearing last

The generated object should remain the focus.

------------------------------------------------------------------------

# 17. Motion / Animation Libraries

The project should use the motion/effects ecosystem at:

https://libraries.dev/#components

Potential uses include:

### Thinking Orbs

Use for processing states such as:

-   SHAPING
-   COMPOSING
-   MATERIALIZING

### Image Generation

Use for generated image reveal/resolution.

### Border Beam

Use sparingly for:

-   Active material preset
-   Primary materialize control
-   CRT processing state

### Metal

Potentially use for a premium metallic button or machine control.

### Gooey

Potentially use for material preset transitions or liquid-like material
changes.

Do not add effects simply because they are available. Every effect
should reinforce the physical-machine metaphor.

------------------------------------------------------------------------

# 18. Dispenser

The lower portion of the page is the physical retrieval mechanism.

It should feel like the bottom of a vending machine.

Before an object is ready:

``` text
DISPENSER OFFLINE

COMPLETE A MATERIALIZATION
TO ACTIVATE RETRIEVAL
```

After generation:

``` text
DISPENSER ONLINE

OBJECT READY FOR RETRIEVAL
↓
```

The user scrolls downward to reveal the dispenser.

------------------------------------------------------------------------

# 19. Retrieval Animation

When the user clicks RETRIEVE:

1.  Button depresses.
2.  DISPENSE indicator illuminates.
3.  Mechanical latch animation.
4.  Object moves toward dispenser opening.
5.  Retrieval flap opens.
6.  Object settles into the tray.
7.  READY/RETRIEVED indicator activates.
8.  Export actions become available.

The object should appear to have physically traveled through the
machine.

The animation does not need true physics; believable staged motion is
sufficient.

------------------------------------------------------------------------

# 20. Final Retrieval State

Example:

``` text
╔════════════════════════════════════╗
║         OBJECT DISPENSER            ║
║                                     ║
║      ┌──────────────────────┐       ║
║      │                      │       ║
║      │      3D OBJECT       │       ║
║      │                      │       ║
║      └──────────────────────┘       ║
║                                     ║
║          OBJECT RETRIEVED            ║
║                                     ║
║       [ DOWNLOAD ] [ VIEW ]          ║
║                                     ║
║          [ MAKE ANOTHER ]            ║
╚════════════════════════════════════╝
```

Export formats can include:

-   PNG
-   WEBP
-   Other formats supported by the underlying renderer

------------------------------------------------------------------------

# 21. Machine Scroll Experience

Scrolling should feel intentional.

The page is physically long enough to communicate:

``` text
CONTROL DECK
      ↓
CRT / FABRICATION
      ↓
STATUS
      ↓
DISPENSER
```

Do not make the machine unnecessarily tall.

Target approximately 1.5--2 viewport heights for the complete experience
on desktop.

Scrolling should reveal new machine sections naturally.

Do not hijack normal browser scrolling unless there is a compelling
reason.

------------------------------------------------------------------------

# 22. Visual Materials

Suggested machine palette:

### Chassis

-   Charcoal
-   Near-black
-   Dark graphite

### Hardware

-   Brushed aluminum
-   Gunmetal
-   Dark chrome
-   Black plastic

### Display

-   Smoked glass
-   Deep black
-   Very subtle green/blue CRT glow if appropriate

### Labels

-   Off-white
-   Muted gray
-   Technical gray

### Indicator lights

Use functional colors:

-   Green = ready/success
-   Amber = processing/warning
-   Red = error
-   White/blue = neutral system state

### Generated object

The generated material itself should provide most of the visual color.

------------------------------------------------------------------------

# 23. Physical Detail Language

Use details sparingly but consistently:

-   Phillips screws
-   Hex bolts
-   Panel seams
-   Recessed panels
-   Metal brackets
-   Rubber gaskets
-   Vent slots
-   Cable ports
-   Tiny engraved labels
-   Warning labels
-   Serial numbers
-   Model numbers
-   Physical indicator housings
-   Rubber feet
-   Small service panels

These details should establish scale and physicality.

Do not decorate every empty space.

------------------------------------------------------------------------

# 24. Interaction Principles

Every interaction should have a physical analogy.

  Digital action      Physical metaphor
  ------------------- -----------------------
  Slider value        Mechanical slider
  Numeric setting     Gauge/readout
  Toggle              Switch
  Material preset     Cartridge
  Reference upload    Input film
  Generate            Push button
  AI processing       Machine operating
  Generated result    Manufactured object
  Scroll down         Move down the machine
  Download/retrieve   Vending dispenser
  Reset               Service/reset switch

The metaphor should make the interface easier to understand, not harder.

------------------------------------------------------------------------

# 25. Accessibility / Usability

Despite the skeuomorphic appearance:

-   Controls must remain keyboard accessible.
-   Native input semantics should be preserved.
-   Tooltips/labels should exist where physical metaphors are ambiguous.
-   Do not rely solely on color for status.
-   Motion should respect `prefers-reduced-motion`.
-   Buttons must have clear text labels.
-   The physical appearance should not prevent mobile/responsive use.
-   Touch targets should remain appropriately sized.
-   Users should never need to understand the fictional machine to use
    the actual application.

The machine is the presentation layer; the underlying interaction should
remain intuitive.

------------------------------------------------------------------------

# 26. Responsive Behavior

Desktop is the primary experience.

On smaller screens:

-   Machine remains visually coherent.
-   Controls stack/reflow.
-   CRT remains prominent.
-   Physical controls become simplified if necessary.
-   Dispenser remains reachable.
-   Avoid horizontal page scrolling.
-   Preserve the machine metaphor without making controls tiny.

The mobile version can become a more compact "control console" while
maintaining the same identity.

------------------------------------------------------------------------

# 27. Product Personality

FORM//LAB should feel:

-   Experimental
-   Tactile
-   Curious
-   Industrial
-   Strange
-   Premium
-   Playful
-   Technical
-   Slightly mysterious

It should feel like a fictional machine someone discovered in an
experimental design laboratory.

Avoid:

-   Corporate SaaS language
-   Generic AI buzzwords
-   Excessive "magic" terminology
-   Generic futuristic gradients
-   Overly childish vending-machine styling

------------------------------------------------------------------------

# 28. Recommended Initial Build Order

Build the experience in layers.

## Phase 1 --- Machine shell

Create:

-   FORM//LAB branding
-   Main industrial chassis
-   CRT enclosure
-   Control panel areas
-   Lower dispenser
-   Physical panel divisions

Do not implement every detail yet.

## Phase 2 --- Core controls

Implement:

-   Reference upload
-   Material presets
-   Color
-   Transparency
-   Puffiness
-   Fold density
-   Asymmetry
-   Gloss
-   Background
-   Generate/materialize

## Phase 3 --- CRT

Implement:

-   Empty state
-   Reference state
-   Parameter preview
-   Processing state
-   Generated result
-   Completed state

## Phase 4 --- Physical interaction

Add:

-   Rotating knobs
-   Switches
-   Buttons
-   Indicator lights
-   Gauges
-   Press animations

## Phase 5 --- Dispenser

Implement:

-   Locked/offline state
-   Ready state
-   Scroll reveal
-   Retrieve button
-   Object movement
-   Retrieval tray
-   Export actions

## Phase 6 --- Motion polish

Add motion effects selectively.

Prioritize:

1.  Materialize animation
2.  CRT result reveal
3.  Indicator transitions
4.  Button/knob physical feedback
5.  Dispenser animation
6.  Preset transitions

## Phase 7 --- Polish

Add:

-   Screws
-   Panel seams
-   Technical labels
-   Subtle glass effects
-   Metal textures
-   Tiny environmental details
-   Sound only if explicitly desired

------------------------------------------------------------------------

# 29. Important Architecture Principle

Separate the **machine presentation layer** from the **generation
engine**.

The UI should not tightly couple the fictional machine behavior to the
actual image-generation implementation.

Conceptually:

``` text
FORM//LAB UI
     │
     ├── Machine State
     │
     ├── Controls
     │
     ├── Animation State
     │
     └── Generation State
              │
              ▼
       Generation Engine
              │
              ▼
        Rendered Object
```

This allows the visual machine to evolve independently from the
underlying generation logic.

------------------------------------------------------------------------

# 30. Generation State Model

Use explicit states rather than scattered booleans.

Suggested states:

``` text
IDLE
REFERENCE_LOADED
CONFIGURING
READY
MATERIALIZING
RENDERING
OBJECT_READY
DISPENSER_READY
RETRIEVING
RETRIEVED
ERROR
```

The UI should derive indicator lights, CRT content, button states, and
dispenser state from this machine state.

------------------------------------------------------------------------

# 31. Preserve the Stable Original

There are two conceptual versions of the project:

### ORIGINAL

Known-good baseline.

Purpose:

-   Preserve existing functionality.
-   Keep as a safety/reference version.
-   Do not redesign aggressively.

### FORM//LAB REMIX

Experimental version.

Purpose:

-   New skeuomorphic interface
-   Material presets
-   CRT
-   Physical controls
-   Machine animation
-   Vending-machine dispenser
-   New interaction model

Do not destroy the original while experimenting.

The remix should be treated as the design laboratory.

------------------------------------------------------------------------

# 32. AI Agent Development Rules

When an AI coding agent works on FORM//LAB:

1.  Inspect the existing project before modifying it.
2.  Do not assume packages are installed.
3.  Do not replace working functionality without understanding it.
4.  Preserve the generation pipeline unless explicitly asked to change
    it.
5.  Build reusable components for physical controls.
6.  Keep machine state centralized.
7.  Keep animation state separate from generation state where practical.
8.  Avoid giant monolithic components.
9.  Keep visual constants/tokens centralized.
10. Make one coherent change at a time.
11. Verify the application after each major change.
12. Prefer progressive enhancement over replacing the entire
    application.
13. Do not add a library merely because it looks cool.
14. Every animation must have a purpose.
15. Preserve responsive and accessible interaction.
16. Keep the original project untouched as the fallback/reference
    implementation.

------------------------------------------------------------------------

# 33. Suggested Component Architecture

A possible React component structure:

``` text
src/
├── components/
│   ├── machine/
│   │   ├── FormLabMachine
│   │   ├── MachineChassis
│   │   ├── ControlPanel
│   │   ├── StatusLights
│   │   ├── AnalogGauge
│   │   └── MachineLabel
│   │
│   ├── controls/
│   │   ├── RotaryKnob
│   │   ├── ToggleSwitch
│   │   ├── MechanicalSlider
│   │   ├── SelectorSwitch
│   │   └── PushButton
│   │
│   ├── crt/
│   │   ├── CRTDisplay
│   │   ├── CRTGlass
│   │   ├── CRTOverlay
│   │   └── CRTState
│   │
│   ├── reference/
│   │   ├── ReferenceInput
│   │   └── ReferenceFilm
│   │
│   ├── materials/
│   │   ├── MaterialSelector
│   │   ├── MaterialPreset
│   │   └── MaterialColorPicker
│   │
│   ├── fabrication/
│   │   ├── MaterializeButton
│   │   ├── FabricationStatus
│   │   └── GenerationProgress
│   │
│   └── dispenser/
│       ├── Dispenser
│       ├── RetrievalSlot
│       └── RetrieveButton
│
├── state/
│   └── machineState
│
├── data/
│   ├── materialPresets
│   └── machineConfig
│
└── styles/
    └── machine.css
```

This is a suggested structure, not a requirement. The existing project
architecture should be inspected first.

------------------------------------------------------------------------

# 34. Core User Journey

The final experience should feel like this:

``` text
                 FORM//LAB
                     │
                     ▼
            INSERT REFERENCE
                     │
                     ▼
             CHOOSE MATERIAL
                     │
                     ▼
            ADJUST INFLATION
                     │
                     ▼
              PRESS MATERIALIZE
                     │
                     ▼
               MACHINE RUNS
                     │
                     ▼
             CRT SHOWS RESULT
                     │
                     ▼
              OBJECT COMPLETE
                     │
                     ▼
              SCROLL DOWN
                     │
                     ▼
             DISPENSER ONLINE
                     │
                     ▼
              RETRIEVE OBJECT
                     │
                     ▼
              EXPORT / REPEAT
```

------------------------------------------------------------------------

# 35. North Star

Every design and implementation decision should support one question:

> **Does this make the user feel like they are operating FORM//LAB, a
> physical machine that manufactures strange soft 3D forms?**

If yes, keep it.

If it is merely decorative, reconsider it.

The goal is not to make a website that looks like a machine.

The goal is to make **the website behave like the machine.**
