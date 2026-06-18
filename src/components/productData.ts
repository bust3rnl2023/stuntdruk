import { ProductAttributes, SelectedConfiguration, ProductType, PricingResponse, PriceBreakdownItem } from '../types';

// Structured Print Option Specifications
export const PRODUCT_SPECIFICATIONS: Record<ProductType, {
  name: string;
  sizes: { id: string; name: string; description?: string; basePrice: number }[];
  paperTypes: { id: string; name: string; description?: string; basePrice: number }[];
  printings: { id: string; name: string; description?: string; basePrice: number }[];
  finishings: { id: string; name: string; description?: string; basePrice: number }[];
  quantities: { id: string; name: string; value: number }[];
}> = {
  business_card: {
    name: "Visitekaartjes",
    sizes: [
      { id: 'standard', name: 'Standaard (85 x 55 mm)', description: 'Het meest gekozen formaat, past perfect in elke portemonnee.', basePrice: 12.50 },
      { id: 'square', name: 'Vierkant (55 x 55 mm)', description: 'Modern en opvallend, uitstekend voor creatieve beroepen.', basePrice: 15.50 }
    ],
    paperTypes: [
      { id: 'mc_mat', name: '350g Silk Mat MC', description: 'Met een gladde finish voor een professionele uitstraling.', basePrice: 0.00 },
      { id: 'naturel_karton', name: '300g Kraft Naturel', description: 'Duurzaam, stevig bruinkarton met een stoere, organische look.', basePrice: 0.05 },
      { id: 'pms_offset', name: '400g Houtvrij Offset', description: 'Extra stevig wit karton, perfect beschrijfbaar.', basePrice: 0.08 }
    ],
    printings: [
      { id: '4_4', name: '4/4 Dubbelzijdig Full Color', description: 'Dubbelzijdige bedrukking voor maximale impact.', basePrice: 7.50 },
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Enkelzijdig bedrukt, achterzijde blijft onbedrukt.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Geen luxe afwerking', description: 'Natuurlijke uitstraling van het gekozen papier.', basePrice: 0.00 },
      { id: 'matt_laminate', name: 'Enkelzijdig Matlaminaat', description: 'Matte plastic beschermlaag voor een fluweelzachte touch.', basePrice: 14.50 },
      { id: 'gloss_laminate', name: 'Enkelzijdig Glanslaminaat', description: 'Glanzende plastic laag die kleuren extra laat spreken.', basePrice: 14.50 }
    ],
    quantities: [
      { id: '100', name: '100 stuks', value: 100 },
      { id: '250', name: '250 stuks', value: 250 },
      { id: '500', name: '500 stuks', value: 500 },
      { id: '1000', name: '1.000 stuks', value: 1000 },
      { id: '2500', name: '2.500 stuks', value: 2500 }
    ]
  },
  flyer: {
    name: "Flyers",
    sizes: [
      { id: 'a_long', name: 'A-Long (74 x 210 mm)', description: 'Smal en elegant, perfect voor menukaarten en acties.', basePrice: 16.00 },
      { id: 'a4', name: 'A4 (210 x 297 mm)', description: 'Groot formaat, ideaal voor productbladen en menu’s.', basePrice: 28.00 },
      { id: 'a5', name: 'A5 (148 x 210 mm)', description: 'Het meest populaire flyerformaat voor hand-outs.', basePrice: 19.50 },
      { id: 'a6', name: 'A6 (105 x 148 mm)', description: 'Compact handzaam formaat, perfect voor actiecoupons.', basePrice: 14.00 },
      { id: 'a7', name: 'A7 (74 x 105 mm)', description: 'Klein zakformaat voor rasechte hand-outs.', basePrice: 11.00 },
      { id: 'a8', name: 'A8 (52 x 74 mm)', description: 'Mini zakformaat, handig voor kleine kortingskaarten.', basePrice: 8.50 }
    ],
    paperTypes: [
      { id: '135g_glans', name: '135g High Gloss', description: 'Glanzend papier, ideaal voor grootschalige promotie.', basePrice: 0.00 },
      { id: '170g_mat', name: '170g Semi-Mat Silk', description: 'Middelzwaar papier voor een chique en matte uitstraling.', basePrice: 0.04 },
      { id: '250g_mat', name: '250g Houtvrij Luxe Mat', description: 'Extra dikke kwaliteit flyer, voelt aan als zacht karton.', basePrice: 0.10 }
    ],
    printings: [
      { id: '4_4', name: '4/4 Dubbelzijdig Full Color', description: 'Aan beide kanten in full color bedrukt.', basePrice: 12.00 },
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Alleen de voorzijde bedrukt.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Geen luxe afwerking', description: 'Standaard geleverd met de natuurlijke papierglans.', basePrice: 0.00 },
      { id: 'uv_gloss', name: 'UV-lak Hoogglans (dubbelzijdig)', description: 'Spiegelende, krasvaste hoogglans vernislaag.', basePrice: 25.00 }
    ],
    quantities: [
      { id: '250', name: '250 stuks', value: 250 },
      { id: '500', name: '500 stuks', value: 500 },
      { id: '1000', name: '1.000 stuks', value: 1000 },
      { id: '2500', name: '2.500 stuks', value: 2500 },
      { id: '5000', name: '5.000 stuks', value: 5000 }
    ]
  },
  poster: {
    name: "Posters",
    sizes: [
      { id: '1185x1750', name: 'Mupi/Abri XL (1185 x 1750 mm)', description: 'Het ultieme buitenformaat voor bushokjes en displays.', basePrice: 38.00 },
      { id: 'a0', name: 'A0 (841 x 1189 mm)', description: 'Zeer groot posterformaat voor maximale impact.', basePrice: 26.50 },
      { id: 'a1', name: 'A1 (594 x 841 mm)', description: 'Traditioneel posterformaat, perfect voor evenementen.', basePrice: 18.50 },
      { id: 'a2', name: 'A2 (420 x 594 mm)', description: 'Middelgroot, ideaal voor winkeletalages.', basePrice: 12.00 },
      { id: 'a3', name: 'A3 (297 x 420 mm)', description: 'Compact posterformaat voor binnengebruik.', basePrice: 7.50 },
      { id: 'abri', name: 'Abri (1000 x 1400 mm)', description: 'Standaard formaat voor abri-reclame.', basePrice: 31.00 },
      { id: 'b1', name: 'B1 (700 x 1000 m)', description: 'Stevig formaat voor stoepborden en muren.', basePrice: 21.00 },
      { id: 'b2', name: 'B2 (500 x 700 mm)', description: 'Subtiel posterformaat, veel gebruikt voor postersets.', basePrice: 14.50 }
    ],
    paperTypes: [
      { id: '135g_poster', name: '135g Houtvrij Gesatineerd Mat', description: 'Duurzaam posterpapier met zijdezachte matte glans.', basePrice: 0.00 },
      { id: '170g_poster', name: '170g Silk Posterpapier', description: 'Extra stevige kwaliteit posterpapier, weerspiegelt niet.', basePrice: 0.05 },
      { id: '250g_poster', name: '250g Fotokwaliteit Glanzend', description: 'Zwaargewicht fotopapier voor haarscherpe prints.', basePrice: 0.15 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Haarscherpe enkelzijdige kleurendruk.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Geen luxe afwerking', description: 'Pristine uitstraling van het posterpapier.', basePrice: 0.00 },
      { id: 'uv_gloss', name: 'UV-lak Enkelzijdig Hoogglans', description: 'Inktbeschermende vernislaag met extra schittering.', basePrice: 12.00 }
    ],
    quantities: [
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 },
      { id: '50', name: '50 stuks', value: 50 },
      { id: '100', name: '100 stuks', value: 100 },
      { id: '250', name: '250 stuks', value: 250 }
    ]
  },
  backlit_poster: {
    name: "Lichtbak Posters (Backlit)",
    sizes: [
      { id: 'abri', name: 'Abri (1000 x 1400 mm)', description: 'Standaard lichtbakformaat.', basePrice: 48.00 },
      { id: 'b1', name: 'B1 (700 x 1000 mm)', description: 'Veelgebruikt formaat voor lichtbakken.', basePrice: 35.00 },
      { id: 'b2', name: 'B2 (500 x 700 mm)', description: 'Compact lichtbakformaat.', basePrice: 24.00 }
    ],
    paperTypes: [
      { id: 'backlit_film', name: 'Transparant Backlit Polyester Film', description: 'Speciale translucent film die het licht egaal verspreidt.', basePrice: 0.00 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color (Double Strike)', description: 'Inktlaag wordt dubbel aangebracht voor diepe kleuren bij achtergrondverlichting.', basePrice: 8.50 }
    ],
    finishings: [
      { id: 'none', name: 'Geen extra afwerking', description: 'Kant-en-klaar voor montage in lichtbak.', basePrice: 0.00 }
    ],
    quantities: [
      { id: '1', name: '1 stuk', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 }
    ]
  },
  rollup_banner: {
    name: "Roll-up Banners",
    sizes: [
      { id: '85x200', name: 'Standaard (85 x 200 cm)', description: 'Het meest populaire handzame formaat.', basePrice: 39.00 },
      { id: '100x200', name: 'Breed (100 x 200 cm)', description: 'Extra breedte voor een grootschalige presentatie.', basePrice: 52.00 }
    ],
    paperTypes: [
      { id: 'karton_cassette', name: 'Karton Eco Cassette', description: 'Milieuvriendelijke kartonnen voet en mast, 100% recyclebaar.', basePrice: 0.00 },
      { id: 'basic_cassette', name: 'Basic Cassette (Aluminium)', description: 'Lichtgewicht aluminium cassette met uitdraaibare voeten.', basePrice: 12.00 },
      { id: 'premium_cassette', name: 'Premium Verchroomde Cassette', description: 'Zware kwaliteit, strakke vormgeving zonder voeten.', basePrice: 28.00 },
      { id: 'luxe_cassette', name: 'Luxe Tear-Drop Cassette', description: 'Hoogwaardige druppelvormige cassette met verchroomde zijkanten.', basePrice: 42.00 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full color (Krasvast mat)', description: 'Geprint op 510g krasvast en niet-krullend materiaal.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Geleverd inclusief stevige draagtas', description: 'Altijd compleet geleverd met tas voor veilig transport.', basePrice: 0.00 }
    ],
    quantities: [
      { id: '1', name: '1 stuk', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 }
    ]
  },
  neon_poster: {
    name: "Neon Posters (Fluor)",
    sizes: [
      { id: 'a0', name: 'A0 (841 x 1189 mm)', description: 'Maximum formaat voor mega opvallende uitingen.', basePrice: 22.00 },
      { id: 'a1', name: 'A1 (594 x 841 mm)', description: 'Opvallend formaat voor lokale evenementen.', basePrice: 15.00 },
      { id: 'a2', name: 'A2 (420 x 594 mm)', description: 'Medium fluorescerend formaat.', basePrice: 11.00 },
      { id: 'a3', name: 'A3 (297 x 420 mm)', description: 'Compact maar onmisbaar neon effect.', basePrice: 7.00 }
    ],
    paperTypes: [
      { id: 'neon_yellow', name: 'Fluorescerend Neon Geel (80g)', description: 'Ultra-helder fluoriserend papier.', basePrice: 0.00 },
      { id: 'neon_green', name: 'Fluorescerend Neon Groen (80g)', description: 'Duurzaam en schreeuwend opvallend groen.', basePrice: 0.00 },
      { id: 'neon_orange', name: 'Fluorescerend Neon Oranje (80g)', description: 'Felle oranje papierkwaliteit.', basePrice: 0.00 }
    ],
    printings: [
      { id: '1_0', name: '1/0 Enkelzijdig Diep Zwart text', description: 'Geprint met dekkend zwart op gekleurd neonpapier.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Geen luxe afwerking', description: 'Standaard neon uitstraling.', basePrice: 0.00 }
    ],
    quantities: [
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 },
      { id: '50', name: '50 stuks', value: 50 },
      { id: '100', name: '100 stuks', value: 100 },
      { id: '250', name: '250 stuks', value: 250 }
    ]
  },
  wallpaper_airtex: {
    name: "Fotobehang (Airtex)",
    sizes: [
      { id: 'custom', name: 'Maatwerk per m²', description: 'Geef uw eigen gewenste breedte en hoogte op in meters.', basePrice: 22.50 }
    ],
    paperTypes: [
      { id: 'airtex_310', name: 'Fotobehang 310 gr/m² Airtex', description: 'Naadloos fotobehang, kreukvrij, krasvast en makkelijk afneembaar.', basePrice: 0.00 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'UV-bestendige printkwaliteit voor haarscherpe foto’s.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Schoon- en haaks gesneden', description: 'Direct klaar om naadloos op de muur te plakken.', basePrice: 0.00 }
    ],
    quantities: [
      { id: '1', name: '1 rol / vlak', value: 1 },
      { id: '2', name: '2 vlakken', value: 2 },
      { id: '5', name: '5 vlakken', value: 5 }
    ]
  },
  wall_circle_gekkotex: {
    name: "Gekkotex Muurcirkels",
    sizes: [
      { id: '50', name: 'Ø 50 cm', basePrice: 18.00 },
      { id: '60', name: 'Ø 60 cm', basePrice: 22.00 },
      { id: '70', name: 'Ø 70 cm', basePrice: 27.00 },
      { id: '80', name: 'Ø 80 cm', basePrice: 33.50 },
      { id: '90', name: 'Ø 90 cm', basePrice: 40.00 },
      { id: '100', name: 'Ø 100 cm', basePrice: 48.00 },
      { id: '110', name: 'Ø 110 cm', basePrice: 57.00 },
      { id: '120', name: 'Ø 120 cm', basePrice: 67.00 },
      { id: '130', name: 'Ø 130 cm', basePrice: 78.00 },
      { id: '140', name: 'Ø 140 cm', basePrice: 90.00 },
      { id: '145', name: 'Ø 145 cm', basePrice: 99.00 }
    ],
    paperTypes: [
      { id: 'gekkotex_self_adhesive', name: 'Gekkotex Zelfklevend Textiel', description: 'Zelfklevend polyester textiel. Makkelijk te verwijderen en herpositioneren zonder lijmresten.', basePrice: 0.00 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color (Zijdeglans)', description: 'Subtiele matte textielstructuur met diepe kleurverzadiging.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Contour gesneden', description: 'Perfect ronde contour snijvorm.', basePrice: 0.00 }
    ],
    quantities: [
      { id: '1', name: '1 cirkel', value: 1 },
      { id: '2', name: '2 cirkels', value: 2 },
      { id: '5', name: '5 cirkels', value: 5 },
      { id: '10', name: '10 cirkels', value: 10 }
    ]
  },
  spandoek: {
    name: "Spandoeken",
    sizes: [
      { id: 'custom', name: 'Maatwerk per m²', description: 'Geef uw eigen afmetingen in breedte x hoogte op.', basePrice: 14.50 }
    ],
    paperTypes: [
      { id: 'frontlit', name: 'Frontlit (PVC) 510 g/m² (B1 Brandvertragend)', description: 'Stevig universeel PVC zeildoek, geschikt voor indoor en outdoor.', basePrice: 0.00 },
      { id: 'mesh', name: 'Mesh 280 g/m² (B1 Brandvertragend, Winddoorlatend)', description: 'Geperforeerd doek, ideaal voor open steigers en winderige plekken.', basePrice: 1.50 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Weer- en UV-bestendige inkten voor langdurig buitengebruik.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Schoongesneden (enkel doek)', description: 'Zonder verdere randafwerking.', basePrice: 0.00 },
      { id: 'zomen_ringen', name: 'Zomen en metalen ringen om de 30 cm', description: 'Versterkte randen en ophangogen ringsom.', basePrice: 8.50 }
    ],
    quantities: [
      { id: '1', name: '1 doek', value: 1 },
      { id: '2', name: '2 doeken', value: 2 },
      { id: '5', name: '5 doeken', value: 5 },
      { id: '10', name: '10 doeken', value: 10 }
    ]
  },
  dranghek_banner: {
    name: "Dranghek Banners",
    sizes: [
      { id: '215x73', name: 'Standaard (215 x 73 cm)', description: 'Exact passend voor de reguliere dranghekken.', basePrice: 24.00 },
      { id: '215x74', name: 'Hoog (215 x 74 cm)', description: 'Net dat beetje extra dekking.', basePrice: 25.50 }
    ],
    paperTypes: [
      { id: 'frontlit', name: 'Frontlit PVC 510 g/m²', description: 'Dicht PVC zeildoek, kleuren springen eruit.', basePrice: 0.00 },
      { id: 'mesh', name: 'Mesh Winddoorlatend 280 g/m²', description: 'Minder windgevoelig dankzij miniscule gaatjes.', basePrice: 1.50 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Enkelzijdige felle printkwaliteit.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Schoongesneden', description: 'Recht afgesneden zeildoek.', basePrice: 0.00 },
      { id: 'zomen_ringen', name: 'Zomen en metalen ringen om de 30 cm', description: 'Rondom gezoomd en voorzien van roestvrije zeilogen.', basePrice: 7.50 }
    ],
    quantities: [
      { id: '1', name: '1 hekwerkdoek', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 }
    ]
  },
  hekwerk_banner: {
    name: "Hekwerk Banners (Bouwhekdoeken)",
    sizes: [
      { id: '338x174', name: 'Bouwhekformaat (338 x 174 cm)', description: 'Ideaal formaat voor de reguliere bouwhekken langs werven.', basePrice: 38.00 }
    ],
    paperTypes: [
      { id: 'frontlit', name: 'Frontlit PVC 510 g/m²', description: 'Volledig dicht PVC zeildoek, blokkeert de inkijk.', basePrice: 0.00 },
      { id: 'mesh', name: 'Mesh Winddoorlatend 280 g/m²', description: 'Sterk winddoorlatend, voorkomt omwaaien van hekken.', basePrice: 2.00 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', description: 'Haarscherpe outdoor bestendige druk.', basePrice: 0.00 }
    ],
    finishings: [
      { id: 'none', name: 'Schoongesneden', description: 'Zonder zoom of ringen.', basePrice: 0.00 },
      { id: 'zomen_ringen', name: 'Zomen en zeilringen om de 30 cm', description: 'Metalen zeilogen gemonteerd om de 30 cm in gezoomde rand.', basePrice: 12.00 }
    ],
    quantities: [
      { id: '1', name: '1 bouwhekdoek', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 }
    ]
  },
  brochures: {
    name: "Brochures / Magazines",
    sizes: [
      { id: 'a4', name: 'A4 Staand (210 x 297 mm)', basePrice: 35.00 },
      { id: 'a5', name: 'A5 Staand (148 x 210 mm)', basePrice: 25.50 }
    ],
    paperTypes: [
      { id: '135g_mc', name: '135g Silk MC met 250g Omslag', basePrice: 0.00 },
      { id: '170g_mc', name: '170g Silk MC Luxe Kwaliteit', basePrice: 0.08 }
    ],
    printings: [
      { id: '4_4', name: '4/4 Dubbelzijdig Full Color', basePrice: 15.00 }
    ],
    finishings: [
      { id: 'stapled', name: 'Geniet (Genaaid gebrocheerd)', basePrice: 8.00 }
    ],
    quantities: [
      { id: '50', name: '50 stuks', value: 50 },
      { id: '100', name: '100 stuks', value: 100 },
      { id: '250', name: '250 stuks', value: 250 }
    ]
  },
  folders: {
    name: "Folders (Gevouwen)",
    sizes: [
      { id: 'a4_to_a5', name: 'A4 gevouwen naar A5 (4 pagina’s)', basePrice: 28.00 },
      { id: 'a5_to_a6', name: 'A5 gevouwen naar A6 (4 pagina’s)', basePrice: 19.50 }
    ],
    paperTypes: [
      { id: '170g_silk', name: '170g Silk MC Papier', basePrice: 0.0 },
      { id: '250g_mat', name: '250g Mat Karton', basePrice: 0.05 }
    ],
    printings: [
      { id: '4_4', name: '4/4 Dubbelzijdig Full Color', basePrice: 12.00 }
    ],
    finishings: [
      { id: 'folded', name: 'Vouwen / Rillen', basePrice: 5.00 }
    ],
    quantities: [
      { id: '100', name: '100 stuks', value: 100 },
      { id: '250', name: '250 stuks', value: 250 },
      { id: '500', name: '500 stuks', value: 500 }
    ]
  },
  fleecedekens: {
    name: "Fleecedekens met Foto",
    sizes: [
      { id: 'standard', name: 'Standaard (130 x 170 cm)', basePrice: 24.00 }
    ],
    paperTypes: [
      { id: 'fleece_polar', name: '300g Polar Fleece (Super zacht)', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color', basePrice: 0.0 }
    ],
    finishings: [
      { id: 'none', name: 'Schoon omgezoomde randen', basePrice: 0.0 }
    ],
    quantities: [
      { id: '1', name: '1 deken', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 }
    ]
  },
  foto_canvas: {
    name: "Foto op Canvas",
    sizes: [
      { id: '40_60', name: '40 x 60 cm', basePrice: 16.00 },
      { id: '60_90', name: '60 x 90 cm', basePrice: 26.00 }
    ],
    paperTypes: [
      { id: 'canvas_2cm', name: 'Canvas op 2cm houten frame', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color Enveloping', basePrice: 0.0 }
    ],
    finishings: [
      { id: 'none', name: 'Volledig gemonteerd', basePrice: 0.0 }
    ],
    quantities: [
      { id: '1', name: '1 canvas', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 }
    ]
  },
  handdoeken: {
    name: "Bedrukte Handdoeken",
    sizes: [
      { id: '50_100', name: 'Handdoek 50 x 100 cm', basePrice: 14.50 }
    ],
    paperTypes: [
      { id: 'terry_cotton', name: '400g Terry Badstof (100% Katoen)', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdige Sublimatiedruk', basePrice: 0.0 }
    ],
    finishings: [
      { id: 'none', name: 'Schoon afgewerkt', basePrice: 0.0 }
    ],
    quantities: [
      { id: '1', name: '1 handdoek', value: 1 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 }
    ]
  },
  mokken: {
    name: "Bedrukte Mokken",
    sizes: [
      { id: 'standard', name: 'Standaard Keramische Mok (325 ml)', basePrice: 7.95 }
    ],
    paperTypes: [
      { id: 'ceramic_white', name: 'Wit Glanzend Keramiek', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Enkelzijdig Full Color Rondom', basePrice: 0.0 }
    ],
    finishings: [
      { id: 'none', name: 'Vaatwasbestendig gebrand', basePrice: 0.0 }
    ],
    quantities: [
      { id: '1', name: '1 mok', value: 1 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 }
    ]
  },
  vlaggen: {
    name: "Mastvlaggen / Gevelvlaggen",
    sizes: [
      { id: '100x150', name: 'Gevelvlag (100 x 150 cm)', basePrice: 17.00 },
      { id: '150x225', name: 'Mastvlag (150 x 225 cm)', basePrice: 28.00 }
    ],
    paperTypes: [
      { id: 'flag_polyester', name: '115g Flag Polyester (Glanzend & Weerbestendig)', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Doordruk (95% doordruk aan achterzijde)', basePrice: 0.0 }
    ],
    finishings: [
      { id: 'with_hooks', name: 'Voorzien van broekingsband en haken', basePrice: 4.50 }
    ],
    quantities: [
      { id: '1', name: '1 vlag', value: 1 },
      { id: '2', name: '2 stuks', value: 2 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 }
    ]
  },
  kleding: {
    name: "Bedrijfskleding (T-shirts & sweaters)",
    sizes: [
      { id: 'tshirt_m', name: 'T-shirt Unisex (Zwart/Wit, Maat M)', basePrice: 14.00 },
      { id: 'tshirt_l', name: 'T-shirt Unisex (Zwart/Wit, Maat L)', basePrice: 14.00 },
      { id: 'sweater_m', name: 'Sweater Unisex (Zwart, Maat M)', basePrice: 24.50 },
      { id: 'sweater_l', name: 'Sweater Unisex (Zwart, Maat L)', basePrice: 24.50 }
    ],
    paperTypes: [
      { id: 'cotton_organic', name: '100% Biologisch Gekamd Katoen', basePrice: 0.0 }
    ],
    printings: [
      { id: '4_0', name: '4/0 Borst- & Rugbedrukking Full Color', basePrice: 5.50 }
    ],
    finishings: [
      { id: 'none', name: 'Professionele textieltransfer', basePrice: 0.0 }
    ],
    quantities: [
      { id: '1', name: '1 stuk', value: 1 },
      { id: '5', name: '5 stuks', value: 5 },
      { id: '10', name: '10 stuks', value: 10 },
      { id: '25', name: '25 stuks', value: 25 }
    ]
  }
};

// Rollover weekends to get real working days for print shop
export function calculateDeliveryDates(baseDateString: string, workingDaysNeeded: number): Date {
  const currentDate = new Date(baseDateString);
  let workingDaysCountObj = 0;
  
  while (workingDaysCountObj < workingDaysNeeded) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDaysCountObj++;
    }
  }
  return currentDate;
}

export function formatDutchDate(date: Date): string {
  const dutchDays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const dutchMonths = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];
  
  const dayName = dutchDays[date.getDay()];
  const dayNum = date.getDate();
  const monthName = dutchMonths[date.getMonth()];
  return `${dayName} ${dayNum} ${monthName}`;
}

// Validation logic and Auto-Correction helper matching Drukwerkdeal behavior
export function validateAndCorrectConfiguration(
  productType: ProductType, 
  config: SelectedConfiguration
): { corrected: SelectedConfiguration; notices: { type: 'info' | 'warning' | 'error'; message: string }[] } {
  
  const corrected = { ...config };
  const notices: { type: 'info' | 'warning' | 'error'; message: string }[] = [];
  const specs = PRODUCT_SPECIFICATIONS[productType];

  if (!specs) {
    return { corrected, notices };
  }

  // Verify that attributes selected actually exist in standard specifications
  if (!specs.sizes.find(s => s.id === corrected.size)) corrected.size = specs.sizes[0].id;
  if (!specs.paperTypes.find(p => p.id === corrected.paperType)) corrected.paperType = specs.paperTypes[0].id;
  if (!specs.printings.find(pr => pr.id === corrected.printing)) corrected.printing = specs.printings[0].id;
  if (!specs.quantities.find(q => q.id === corrected.quantity)) corrected.quantity = specs.quantities[0].id;
  if (!specs.finishings.find(f => f.id === corrected.finishing)) corrected.finishing = specs.finishings[0].id;

  // Custom size limits checks (default setup)
  if (corrected.size === 'custom') {
    if (!corrected.width) corrected.width = '1.0';
    if (!corrected.height) corrected.height = '1.0';
    const w = parseFloat(corrected.width);
    const h = parseFloat(corrected.height);
    if (isNaN(w) || w <= 0.1) {
      corrected.width = '1.0';
      notices.push({ type: 'warning', message: 'Minimale breedte is 0.1 meter. Geherkalibreerd naar 1.0 m.' });
    }
    if (isNaN(h) || h <= 0.1) {
      corrected.height = '1.0';
      notices.push({ type: 'warning', message: 'Minimale hoogte is 0.1 meter. Geherkalibreerd naar 1.0 m.' });
    }
  }

  // Rule 1: Business Cards laminated finishing (matt_laminate or gloss_laminate) is ONLY compatible with 'mc_mat'
  if (productType === 'business_card') {
    if (corrected.paperType !== 'mc_mat' && (corrected.finishing === 'matt_laminate' || corrected.finishing === 'gloss_laminate')) {
      corrected.finishing = 'none';
      notices.push({
        type: 'warning',
        message: 'Luxe plastic veredeling is enkel mogelijk op 350g Silk Mat MC papier. Afwerking is hersteld naar "Geen".'
      });
    }
  }

  // Rule 2: Flyers UV High gloss finishing is ONLY compatible with '250g_mat'
  if (productType === 'flyer') {
    if (corrected.paperType !== '250g_mat' && corrected.finishing === 'uv_gloss') {
      corrected.finishing = 'none';
      notices.push({
        type: 'warning',
        message: 'Uiterst spiegelende UV-lak is enkel verwerkbaar op stevig 250g Luxe Mat papier. Afwerking is hersteld naar "Geen".'
      });
    }
  }

  return { corrected, notices };
}

// Detailed Formula-Based Price Calculation Engine
export function calculateProductPrice(
  productType: ProductType,
  config: SelectedConfiguration,
  isExpress: boolean,
  currentDateString: string
): PricingResponse {
  const { corrected, notices } = validateAndCorrectConfiguration(productType, config);
  const specs = PRODUCT_SPECIFICATIONS[productType];

  if (!specs) {
    return {
      valid: false,
      error: "Onbekend product type geselecteerd.",
      prices: { net: 0, vat: 0, gross: 0, isExpress },
      delivery: { estimatedDate: "", workingDays: 4, urgencyText: "" },
      breakdown: []
    };
  }

  const sizeObj = specs.sizes.find(s => s.id === corrected.size)!;
  const paperObj = specs.paperTypes.find(p => p.id === corrected.paperType)!;
  const printObj = specs.printings.find(pr => pr.id === corrected.printing)!;
  const finishObj = specs.finishings.find(f => f.id === corrected.finishing)!;
  const quantValue = specs.quantities.find(q => q.id === corrected.quantity)!.value;

  const breakdown: PriceBreakdownItem[] = [];

  // 1. Formaat Basistarief (with support for custom sizes in meters)
  let sizeBase = sizeObj.basePrice;
  let customSqM = 1;
  if (corrected.size === 'custom') {
    const w = parseFloat(corrected.width || '1.0');
    const h = parseFloat(corrected.height || '1.0');
    customSqM = w * h;
    sizeBase = sizeObj.basePrice * customSqM;
    breakdown.push({ label: `Basistarief op maat (${w}m x ${h}m = ${customSqM.toFixed(2)} m²)`, value: sizeBase });
  } else {
    breakdown.push({ label: `Basistarief format (${sizeObj.name})`, value: sizeBase });
  }

  // 2. Grondstoffen (Papier & Grammage toeslag)
  const paperUnitCost = paperObj.basePrice;
  const totalPaperCost = (corrected.size === 'custom' ? paperUnitCost * customSqM : paperUnitCost) * quantValue;
  if (totalPaperCost > 0) {
    breakdown.push({ label: `Papierkwaliteit / materiaal toeslag (${paperObj.name})`, value: totalPaperCost });
  }

  // 3. Pers-Instelkosten (Setup cost)
  let setupCost = 20.00;
  if (productType === 'business_card') setupCost = 14.50;
  else if (productType === 'flyer') setupCost = 25.00;
  else if (productType === 'poster') setupCost = 15.00;
  else if (productType === 'backlit_poster') setupCost = 22.00;
  else if (productType === 'wallpaper_airtex' || productType === 'spandoek') setupCost = 30.00;
  
  breakdown.push({ label: "Pers-instelkosten en prepress", value: setupCost });

  // 4. Inkt Toeslag (4/4 versus 4/0 bedrukking)
  const printingUnitSurcharge = productType === 'business_card' 
    ? (corrected.printing === '4_4' ? 0.04 : 0.00)
    : (corrected.printing === '4_4' ? 0.06 : 0.00);
  const totalInktPrice = (printObj.basePrice + (printingUnitSurcharge * quantValue));
  if (totalInktPrice > 0) {
    breakdown.push({ label: `Inkt & bedrukking toeslag (${printObj.name})`, value: totalInktPrice });
  }

  // 5. Luxe Veredelings-afwerking
  let finishingCost = 0;
  if (corrected.finishing !== 'none') {
    const finishSetup = productType === 'business_card' ? 12.00 : 20.00;
    const finishUnit = productType === 'business_card' ? 0.08 : 0.12;
    finishingCost = finishSetup + (finishUnit * quantValue) + (finishObj.basePrice || 0);
    breakdown.push({ label: `Luxe veredeling toeslag (${finishObj.name})`, value: finishingCost });
  }

  // Calculate Net Total before bulk discount
  let rawNetTotal = sizeBase + totalPaperCost + setupCost + totalInktPrice + finishingCost;

  // 6. Volumekorting (Bulk Discounts)
  let discountPct = 0;
  if (productType === 'business_card') {
    if (quantValue === 250) discountPct = 15;
    else if (quantValue === 500) discountPct = 30;
    else if (quantValue === 1000) discountPct = 45;
    else if (quantValue === 2500) discountPct = 60;
  } else if (productType === 'flyer' || productType === 'poster') {
    if (quantValue === 500 || quantValue === 50) discountPct = 12;
    else if (quantValue === 1000 || quantValue === 100) discountPct = 25;
    else if (quantValue === 2500 || quantValue === 250) discountPct = 40;
    else if (quantValue === 5000) discountPct = 52;
  } else {
    // Standard incremental bulk discounts for newer print segments
    if (quantValue >= 25) discountPct = 25;
    else if (quantValue >= 10) discountPct = 15;
    else if (quantValue >= 5) discountPct = 10;
    else if (quantValue >= 2) discountPct = 5;
  }

  const savingsValue = rawNetTotal * (discountPct / 100);
  let netPriceWithDiscount = rawNetTotal - savingsValue;

  if (discountPct > 0) {
    breakdown.push({ label: `Combineervoordeel / Volumekorting (-${discountPct}%)`, value: -savingsValue });
  }

  // 7. Express Urgency Surcharge
  let expressSurcharge = 0;
  if (isExpress) {
    expressSurcharge = Math.max(15.00, netPriceWithDiscount * 0.25);
    breakdown.push({ label: "Express-levering toeslag (+25% spoedtarief)", value: expressSurcharge });
  }

  const finalNetPrice = Math.round((netPriceWithDiscount + expressSurcharge) * 100) / 100;
  const vatValue = Math.round((finalNetPrice * 0.21) * 100) / 100; // Dutch standard 21% BTW
  const grossPrice = Math.round((finalNetPrice + vatValue) * 100) / 100;

  // Delivery Calculations
  const deliveryDays = isExpress ? 2 : 4;
  const deliveryDateObj = calculateDeliveryDates(currentDateString, deliveryDays);
  const formattedDelivery = formatDutchDate(deliveryDateObj);

  return {
    valid: true,
    prices: {
      net: finalNetPrice,
      vat: vatValue,
      gross: grossPrice,
      savings: Math.round(savingsValue * 100) / 100,
      isExpress
    },
    delivery: {
      estimatedDate: formattedDelivery,
      workingDays: deliveryDays,
      urgencyText: isExpress ? "Met spoed verzonden (Express)" : "Standaard gratis bezorging"
    },
    breakdown
  };
}
