import { type SubsidyWrapper } from "@/hooks/store";

export const mockSubsidies: SubsidyWrapper[] = [
  {
    subsidy: {
      title: "BEG WG – Effizienzhaus-Kredit (KfW 261)",
      href: "https://www.kfw.de/261",
      benefits: { unit: "%", type: "upTo", value: 25, for: "max. 37.500 €" },
      content:
        "Zinsgünstiger Kredit + nicht rückzahlbarer Tilgungszuschuss für die Komplettsanierung zum Effizienzhaus-Standard. Antrag über Hausbank.\n\nTilgungszuschuss je Effizienzhaus- Stufe: \nEH 85: 5 % | EH 70: 10 % | EH 55: 15 % | EH 40: 20 %\n\nBoni(kumulierbar): \n + 5 % Erneuerbare - Energien - Klasse(EE) \n + 10 % Worst Performing Building(WPB: schlechtestes Quartil) \n + 15 % Seriell - Sanierung(vorgefertigte Fassadenmodule) \n\nMax.Kreditbetrag: 120.000 €/WE (150.000 €/WE mit EE -/NH-Klasse) \n\nBedingungen: \n - Bestandsgebäude ≥ 5 Jahre alt\n - Energieeffizienz - Experte(dena - Liste) verpflichtend\n - Antrag vor Auftragsvergabe\n - Nicht kombinierbar mit §35c EStG für dieselben Maßnahmen",
    },
    isActive: true,
  },

  {
    subsidy: {
      title: "BEG WG – Effizienzhaus-Kredit (KfW 261)",
      href: "https://www.kfw.de/261",
      benefits: { unit: "%", type: "upTo", value: 25, for: "max. 37.500 €" },
      content:
        "Zinsgünstiger Kredit + nicht rückzahlbarer Tilgungszuschuss für die Komplettsanierung zum Effizienzhaus-Standard. Antrag über Hausbank.\n\nTilgungszuschuss je Effizienzhaus- Stufe: \nEH 85: 5 % | EH 70: 10 % | EH 55: 15 % | EH 40: 20 %\n\nBoni(kumulierbar): \n + 5 % Erneuerbare - Energien - Klasse(EE) \n + 10 % Worst Performing Building(WPB: schlechtestes Quartil) \n + 15 % Seriell - Sanierung(vorgefertigte Fassadenmodule) \n\nMax.Kreditbetrag: 120.000 €/WE (150.000 €/WE mit EE -/NH-Klasse) \n\nBedingungen: \n - Bestandsgebäude ≥ 5 Jahre alt\n - Energieeffizienz - Experte(dena - Liste) verpflichtend\n - Antrag vor Auftragsvergabe\n - Nicht kombinierbar mit §35c EStG für dieselben Maßnahmen",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Heizungsförderung – Wohngebäude (KfW 458)",
      href: "https://www.kfw.de/458",
      benefits: { unit: "%", type: "upTo", value: 70, for: "max. 21.000 €" },
      content:
        'Direktzuschuss für den Austausch alter Heizsysteme gegen erneuerbare Alternativen (Wärmepumpe, Solarthermie, Biomasse, Fernwärme).\n\nZuschuss-Bausteine:\n30 % Grundförderung (immer)\n+5 % Effizienzbonus (Wärmepumpe mit Wasser-/Erdreich-/Abwasserquelle oder Kältemittel R290)\n+20 % Klimageschwindigkeitsbonus (Ersatz von Öl-/Kohle-/Gasetagenheizung, Nachtspeicher oder Gas-/Biomasse-Heizung ≥ 20 Jahre alt)\n+30 % Einkommensbonus (Haushaltseinkommen ≤ 40.000 €/Jahr, nur Eigennutzer)\nMaximum: 70 %\n\nFörderfähige Kosten: max. 30.000 €/WE (1. WE), 15.000 € (WE 2–6), 8.000 € (WE 7+)\n\nBedingungen:\n- Bestandsgebäude ≥ 5 Jahre alt\n- Hydraulischer Abgleich als Nebenmaßnahme erforderlich\n- Direktantrag über KfW-Portal „Meine KfW"\n- Für Vermieter: max. 50 % (kein Einkommensbonus)\n- Nicht kombinierbar mit §35c EStG für dieselbe Maßnahme',
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "BEG Einzelmaßnahmen Ergänzungskredit (KfW 358/359)",
      href: "https://www.kfw.de/358",
      benefits: { unit: "€", type: "upTo", value: 120000 },
      content:
        "Zinsgünstiges Darlehen zur Ergänzungsfinanzierung des Eigenanteils nach einem BEG-EM- (BAFA) oder Heizungsförderungs-Zuschuss (KfW 458).\n\nKfW 358 Plus (stark verbilligter Zins, ab 0,01 % eff. p.a.):\n- Nur Eigennutzer mit Haushaltseinkommen ≤ 90.000 €/Jahr\n\nKfW 359 (moderat verbilligter Zins):\n- Alle Eigentümer inkl. Vermieter, WEG, Unternehmen\n\nBedingungen:\n- Setzt bewilligten Zuschuss (KfW 458 oder BAFA BEG EM) voraus\n- Antrag innerhalb von 12 Monaten nach Zuschuss-Bescheid\n- Max. Kreditbetrag: 120.000 €",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "BEG Einzelmaßnahmen – Zuschuss (BAFA)",
      href: "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Sanierung_Wohngebaeude",
      benefits: { unit: "%", type: "upTo", value: 20, for: "max. 12.000 €" },
      content:
        "Direktzuschuss für einzelne energetische Maßnahmen ohne Effizienzhaus-Ziel.\n\nFörderfähige Maßnahmen:\n- Gebäudehülle: Außenwanddämmung, Dachdämmung, OGD, Kellerdecke, Fenster/Türen (U ≤ 0,95 W/m²K), Sonnenschutz\n- Anlagentechnik: Lüftungsanlage mit WRG, Gebäudeautomation (Klasse B)\n- Heizungsoptimierung: Hydraulischer Abgleich, Pumpentausch, Rohrdämmung\n\nZuschuss:\n15 % Grundförderung\n+5 % iSFP-Bonus (bei Maßnahme aus individuellem Sanierungsfahrplan, max. 15 Jahre nach iSFP-Erstellung)\n\nFörderfähige Kosten: max. 60.000 €/WE (mit iSFP), sonst 30.000 €/WE\n\nTechnische Mindest-U-Werte:\nAußenwand: ≤ 0,20 W/m²K | Dach: ≤ 0,14 W/m²K | Fenster: ≤ 0,95 W/m²K\n\nBedingungen:\n- Bestandsgebäude ≥ 5 Jahre alt\n- Antrag vor Auftragsvergabe\n- Kombinierbar mit KfW 358/359 (Ergänzungskredit)\n- Nicht kombinierbar mit §35c EStG für dieselbe Maßnahme",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Steuerermäßigung energetische Sanierung (§35c EStG)",
      href: "https://www.bundesfinanzministerium.de",
      benefits: { unit: "%", type: "upTo", value: 20, for: "max. 40.000 €" },
      content:
        "Direkte Minderung der Einkommensteuer für energetische Sanierungsmaßnahmen an selbstgenutztem Wohneigentum – kein separater Antrag, über Steuererklärung.\n\nSteuerbonus: 20 % der Sanierungskosten verteilt auf 3 Jahre:\nJahr 1 + 2: je 7 % (max. 14.000 €/Jahr)\nJahr 3: 6 % (max. 12.000 €)\nGesamtmaximum: 40.000 € je Objekt (auf Basis von max. 200.000 € Kosten)\n\nFörderfähige Maßnahmen: Dämmung, Fenster/Türen, Lüftung, Heizungserneuerung, Gebäudeautomation (nicht: PV-Anlage, Batteriespeicher)\n\nBedingungen:\n- Nur Eigennutzer (Vermieter ausgeschlossen)\n- Gebäude bei Maßnahmenbeginn ≥ 10 Jahre alt\n- Ausführung durch zertifiziertes Fachunternehmen + BMF-Bescheinigung\n- Maßnahme bis 31.12.2029 abgeschlossen\n- Nicht kombinierbar mit BEG WG oder BEG EM für dieselbe Maßnahme\n- Kombinierbar mit BEG EM für andere Maßnahmen am selben Gebäude",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Energieberatung Wohngebäude inkl. iSFP (BAFA)",
      href: "https://www.bafa.de/DE/Energie/Energieberatung/Energieberatung_Wohngebaeude",
      benefits: { unit: "%", type: "upTo", value: 50, for: "max. 1.100 €" },
      content:
        "Zuschuss für Vor-Ort-Energieberatung und Erstellung eines individuellen Sanierungsfahrplans (iSFP).\n\nZuschusshöhe (50 % der Beratungskosten):\n- Ein-/Zweifamilienhaus: max. 650 €\n- Gebäude ≥ 3 Wohneinheiten: max. 850 €\n- Zusatz bei WEG-Präsentation: +250 €\n\nStrategischer Vorteil: Ein erstellter iSFP aktiviert den +5 %-iSFP-Bonus bei allen nachfolgenden BEG-EM-Maßnahmen (innerhalb von 15 Jahren).\n\nBedingungen:\n- Durchführung durch zugelassenen Energieberater (dena-/BfEE-Expertenliste)\n- Förderzeitraum bis 31.12.2026",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Bayerisches Modernisierungsprogramm (BayModR)",
      href: "https://www.bayernlabo.de/mietwohnraum/bayerisches-modernisierungsprogramm",
      benefits: { unit: "€/m²", type: "upTo", value: 500 },
      content:
        "Zinsgünstiges Darlehen + Zuschuss für Modernisierungsmaßnahmen an Mietwohngebäuden. Antrag bei BayernLabo / Regierung Oberpfalz.\n\nZuschuss: bis zu 500 €/m² Wohnfläche\n- Basiszuschuss: bis 300 €/m²\n- Nachhaltigkeitszuschuss: bis weitere 200 €/m²\n- Max. Zuschuss: 25 % des bewilligten Darlehens\n\nDarlehen: bis zu 100 % der förderfähigen Kosten (Mindestkosten 5.000 €/WE)\n\nFörderfähige Maßnahmen: Energetische Sanierung, Barrierefreiheit, Sanitärinstallationen, Erneuerbare Energien u. v. m.\n\nBedingungen:\n- Nur Vermieter (mind. 3 Mietwohnungen im Gebäude)\n- Gebäude ≥ 15 Jahre alt (≥ 5 Jahre bei Kombination mit BEG)\n- Belegungsbindung 10 Jahre nach Fertigstellung\n- Antrag vor Maßnahmenbeginn\n- Kombinierbar mit BEG WG und BEG EM",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Regensburg effizient – Sanierung (nachwachsende Rohstoffe)",
      href: "https://www.regensburg.de/greendeal/mitmachen/staedtische-foerderungen-zum-klimaschutz",
      benefits: { unit: "€", type: "upTo", value: 10000 },
      content:
        "Städtischer Zuschuss der Stadt Regensburg für Gebäudehüllensanierung ausschließlich mit nachwachsenden Rohstoffen.\n\nFördersätze:\n- Ökologische Wärmedämmung (nachwachsende Rohstoffe): 15 €/m² gedämmter Fläche\n- Holzfenster / Holzaußentüren: 20 €/m² Bauteilfläche\n- Holz-Aluminium-Fenster/-Türen: 15 €/m² Bauteilfläche\n\nBedingungen:\n- Bestandsgebäude ≥ 5 Jahre alt, max. 10 Wohneinheiten\n- Max. 2 verschiedene Maßnahmen je Liegenschaft\n- Max. 10.000 € Gesamtzuschuss je Liegenschaft (nicht je WE)\n- Antrag vor Maßnahmenbeginn bei der Stadt Regensburg\n- Kombinierbar mit BEG EM (BAFA)\n- Kontakt: klimaschutz@regensburg.de | Tel. 0941/507-3022",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Regensburg effizient – Photovoltaik",
      href: "https://www.regensburg.de/greendeal/mitmachen/staedtische-foerderungen-zum-klimaschutz",
      benefits: { unit: "€", type: "upTo", value: 1500 },
      content:
        "Städtischer Zuschuss der Stadt Regensburg für neu installierte PV-Anlagen.\n\nFördersätze:\n- Standard (Dach): 100 €/kWp, max. 1.500 €\n- Denkmalgeschütztes Gebäude oder Fassadeninstallation: 200 €/kWp\n\nBedingungen:\n- Antrag vor Kauf/Installationsbeginn\n- Eine Förderung je Gebäude\n- Antragsberechtigt: Privatpersonen, Unternehmen, WEGs",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "Regensburg resilient – Gebäudebegrünung",
      href: "https://www.regensburg.de/greendeal/mitmachen/staedtische-foerderungen-zum-klimaschutz",
      benefits: { unit: "€", type: "upTo", value: 4000 },
      content:
        "Städtischer Zuschuss der Stadt Regensburg für Dach- und Fassadenbegrünung sowie Entsiegelungsmaßnahmen (Klimaanpassung: Hitzeschutz, Regenwasser).\n\nFörderbetrag: bis zu 4.000 € je Maßnahme / Liegenschaft\n\nBedingungen:\n- Antrag vor Maßnahmenbeginn\n- Maßnahme an bestehendem Gebäude\n- Programm läuft bis 31.12.2026",
    },
    isActive: true,
  },
  {
    subsidy: {
      title: "REWAG – Förderung Photovoltaik",
      href: "https://www.rewag.de/foerderungen",
      benefits: { unit: "€", type: "upTo", value: 400 },
      content:
        "Zuschuss der REWAG (Stadtwerk Regensburg) aus dem Grüner-Strom-Label-Fonds.\n\nFördersätze:\n- PV-Anlage (Dach/Fassade): bis 400 €\n- Balkonkraftwerk / Mini-PV: 50 €\n- Post-EEG-Anlagen bis 5,5 kWp: bis 240 €\n\nBedingungen:\n- Aktiver Energieliefervertrag mit REWAG erforderlich (Tarif rewario.strom.natur.regio oder rewario.strom.mobil)\n- Gebäude im Versorgungsgebiet Regensburg\n- Kombinierbar mit Regensburg effizient – Photovoltaik",
    },
    isActive: true,
  },
];
