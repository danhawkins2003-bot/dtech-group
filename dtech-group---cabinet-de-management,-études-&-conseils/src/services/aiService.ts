export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'view_course' | 'enroll_course' | 'verify_cert' | 'view_centers' | 'navigate';
    targetId?: string;
    path?: string;
  }[];
}

export interface AiChatResponse {
  reply: string;
  model: string;
  suggestions?: string[];
  recommendedCourseIds?: string[];
}

export const aiService = {
  async askAdvisor(
    message: string, 
    history: { role: 'user' | 'assistant' | 'model'; text: string }[] = []
  ): Promise<AiChatResponse> {
    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: history.map(h => ({
            role: h.role === 'assistant' ? 'model' : h.role,
            text: h.text
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Erreur serveur (${response.status})`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[AI Service] Erreur ou mode hors-ligne, utilisation du fallback local:', err);
      // Fallback local intelligent si le serveur ne répond pas
      return this.getLocalFallback(message);
    }
  },

  getLocalFallback(message: string): AiChatResponse {
    const q = message.toLowerCase();

    // Modalités d'admission et pièces du dossier
    if (q.includes('admission') || q.includes('dossier') || q.includes('pièce') || q.includes('piéce') || q.includes('inscription') || q.includes('condition') || q.includes('document')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Modalités Officielles d'Admission & Constitution du Dossier\n\nBienvenue chez **DTECH GROUP & INSTITUT SUPÉRIEUR DELXIA** (*Agrément N° 003 / METFP / CAB / SE-CPO*). Voici les pièces requises pour constituer votre dossier d'admission pour la rentrée du **14 Septembre 2026** :\n\n1. **Fiche d'inscription officielle** dument renseignée et signée (disponible au secrétariat ou en ligne).\n2. **Deux (02) photos d'identité couleur récentes** sur fond blanc.\n3. **Une (01) photocopie légalisée** de la Carte Nationale d'Identité (CNI), du passeport ou de l'acte de naissance.\n4. **Une (01) copie du dernier diplôme ou attestation** (BEPC, BAC 1, BAC 2, BTS, Licence, Master ou certificat de scolarité selon la filière demandée).\n5. **Versement de la 1ère tranche (60%)** des frais de formation lors du dépôt du dossier.\n\n*Validation des inscriptions :* Vous pouvez déposer votre dossier physique dans l'un de nos **7 centres au Togo** ou effectuer votre pré-inscription en ligne avec règlement par **Togocom T-Money (\*145#)** ou **Moov Flooz (\*155#)**.`,
        suggestions: ['Quelles sont les 6 filières diplômantes d\'État ?', 'Adresses des 7 centres au Togo', 'Simuler le paiement en 2 tranches (60% / 40%)'],
        recommendedCourseIds: []
      };
    }

    // Fonctionnement du centre, formule 9 mois + 3 mois de stage
    if (q.includes('fonctionnement') || q.includes('stage') || q.includes('durée') || q.includes('formule') || q.includes('9 mois') || q.includes('rentrée') || q.includes('horaire') || q.includes('cours du soir') || q.includes('cours du jour')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Fonctionnement Pédagogique & Formule d'Excellence\n\nLe modèle d'apprentissage **DTECH GROUP & DELXIA** garantit une insertion professionnelle rapide grâce à sa structure rigoureuse :\n\n- **Formule d'apprentissage :** **9 MOIS DE FORMATION THÉORIQUE & PRATIQUE INTENSIVE + 3 MOIS DE STAGES EN ENTREPRISE GARANTIS**.\n- **Pédagogie active :** 80% de travaux pratiques en salles multimédias climatisées équipées d'ordinateurs Dell/HP et connexion fibre optique dédiée.\n- **Prochaine Rentrée Solennelle :** **14 Septembre 2026** dans l'ensemble de nos 7 centres au Togo.\n- **Créneaux horaires au choix :**\n  • **Cours du jour :** 08h30 - 12h30 (du lundi au vendredi)\n  • **Cours du soir :** 18h30 - 20h30 (idéal pour travailleurs et étudiants)\n- **Diplôme délivré :** Diplôme Professionnel d'État agréé par le Ministère de l'Enseignement Technique (METFP).\n- **Placement en stage :** Convention officielle tripartite signée avec nos entreprises et cabinets partenaires au Togo.`,
        suggestions: ['Pièces à fournir pour l\'admission', 'Coût des formations diplômantes', 'Contacter le centre le plus proche'],
        recommendedCourseIds: []
      };
    }

    // Modalités de Paiement & Échelonnement
    if (q.includes('tmoney') || q.includes('t-money') || q.includes('flooz') || q.includes('moov') || q.includes('payer') || q.includes('paiement') || q.includes('tranche') || q.includes('frais') || q.includes('prix') || q.includes('tarif') || q.includes('échelonn')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Modalités de Règlement & Facilités d'Échelonnement\n\nPour rendre nos formations d'excellence accessibles, **DTECH GROUP** applique une politique de paiement souple et transparente :\n\n1. **Formule d'échelonnement officiel :**\n   - **1ère tranche (60%) :** Versée à l'inscription pour valider la place et recevoir le kit pédagogique.\n   - **2ème tranche (40%) :** Versée au 5ème mois de formation.\n2. **Moyens de paiement acceptés :**\n   - **Togocom T-Money :** Validation instantanée via le code USSD **\*145#**.\n   - **Moov Money (Flooz) :** Validation sécurisée via le code USSD **\*155#**.\n   - **Espèces / Chèques :** Directement aux guichets administratifs de nos 7 centres.\n\nChaque versement génère immédiatement un reçu officiel et débloque vos accès sur le portail étudiant.`,
        suggestions: ['Simuler mon paiement échelonné', 'Découvrir les 7 centres de formation', 'Dossier d\'inscription requis'],
        recommendedCourseIds: []
      };
    }

    // Réseau des 7 Centres
    if (q.includes('centre') || q.includes('siège') || q.includes('adresse') || q.includes('kara') || q.includes('lomé') || q.includes('lome') || q.includes('avédji') || q.includes('avedji') || q.includes('avépozo') || q.includes('avepozo') || q.includes('kpalimé') || q.includes('kpalime') || q.includes('atakpamé') || q.includes('atakpame') || q.includes('sokodé') || q.includes('sokode') || q.includes('dapaong')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Réseau National des 7 Centres DTECH GROUP au Togo\n\nNos centres pédagogiques et laboratoires multimédias vous accueillent du lundi au samedi :\n\n1. **Lomé Avédji (Siège Pédagogique) :** (+228) 92 89 89 79 *(Face pharmacie de la nation)*\n2. **Avépozo :** (+228) 98 82 82 16 *(À côté de l'église catholique)*\n3. **Kpalimé :** (+228) 90 53 57 57 *(Carrefour Texaco)*\n4. **Atakpamé :** (+228) 70 16 01 01 *(Carrefour Agbonou)*\n5. **Sokodé :** (+228) 93 49 85 85 *(En face de la préfecture)*\n6. **Kara :** (+228) 90 18 40 78 *(Quartier Tomdè / Face BCEAO)*\n7. **Dapaong :** (+228) 92 67 77 90 *(Nassablé / Proche Grand Marché)*\n\n*Permanence Téléphonique & WhatsApp :* **(+228) 92 89 89 79**.`,
        suggestions: ['Horaires des cours du jour et du soir', 'Constituer mon dossier d\'inscription', 'Quelle filière choisir ?'],
        recommendedCourseIds: []
      };
    }

    // Comptabilité & Sage 100
    if (q.includes('compta') || q.includes('sage') || q.includes('syscohada') || q.includes('finance') || q.includes('gestion')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Filière : Comptabilité d'Entreprise, Sage 100 & Fiscalité OTR\n\nFormation pratique homologuée de haut niveau pour intégrer cabinets d'expertise comptable et directions financières :\n\n- **Formule :** 9 Mois de cours + 3 Mois de stage garanti en entreprise\n- **Tarif :** 195 000 FCFA *(soit 117 000 FCFA à l'inscription + 78 000 FCFA au 5ème mois)*\n- **Logiciels & Normes :** Sage 100 Comptabilité & Paie RH i7, SYSCOHADA Révisé, téléprocédures OTR Togo\n- **Compétences clés :** Saisie des écritures, rapprochements, balances, bilans, comptes de résultat, liasse fiscale OTR\n- **Débouchés :** Comptable d'entreprise, Assistant de gestion, Auditeur junior, Gestionnaire de paie.`,
        suggestions: ['S\'inscrire en Comptabilité Sage 100', 'Pièces à fournir pour l\'admission', 'Payer par T-Money (*145#)'],
        recommendedCourseIds: ['comptabilite-gestion-sage100']
      };
    }

    // Secrétariat Médical ou Direction
    if (q.includes('secrétariat') || q.includes('secretariat') || q.includes('médical') || q.includes('medical') || q.includes('bilingue') || q.includes('direction')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Filières Secrétariat d'Excellence (9 Mois + 3 Mois de Stage)\n\nDeux filières à très forte employabilité au Togo :\n\n1. **Secrétariat de Direction Bilingue (180 000 FCFA) :**\n   - Bureautique avancée (Word, Excel, PowerPoint), rédaction administrative en anglais et français, gestion d'agenda de direction, organisation de réunions et visioconférences.\n2. **Secrétariat Médical (195 000 FCFA) :**\n   - Terminologie médicale, accueil et prise en charge des patients, logiciels de gestion clinique/hospitalière, archivage et déontologie médicale.\n\n*Stages garantis de 3 mois :* En cliniques, hôpitaux, ministères, institutions internationales et directions générales.`,
        suggestions: ['Dossier d\'inscription Secrétariat', 'Rentrée du 14 Septembre 2026', 'Calculer les 2 tranches de paiement'],
        recommendedCourseIds: ['secretariat-direction-bilingue', 'secretariat-medical']
      };
    }

    // Transit Douane
    if (q.includes('transit') || q.includes('douane') || q.includes('port') || q.includes('logistique') || q.includes('sydonia') || q.includes('fret')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Filière : Transit Douane & Logistique Portuaire\n\nSpécialisation stratégique tournée vers l'activité portuaire et aéroportuaire du Togo :\n\n- **Formule :** 9 Mois intensifs + 3 Mois de stage garanti\n- **Tarif :** 220 000 FCFA *(ou 132 000 FCFA à l'inscription + 88 000 FCFA au 5ème mois)*\n- **Contenu :** Procédures douanières Sydonia World, Port Autonome de Lomé (PAL), dédouanement import/export, déclarations OTR, incoterms 2020, logistique maritime et aérienne\n- **Débouchés :** Déclarant en douane, Agent de consignation maritime, Gestionnaire de fret et transit.`,
        suggestions: ['S\'inscrire en Transit Douane', 'Pièces pour le dossier d\'admission', 'Infoline Lomé Avédji (+228 92 89 89 79)'],
        recommendedCourseIds: ['transit-douane-logistique']
      };
    }

    // Infographie & Audiovisuel
    if (q.includes('infographie') || q.includes('design') || q.includes('adobe') || q.includes('photoshop') || q.includes('illustrator') || q.includes('vidéo') || q.includes('video') || q.includes('graphique')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Filière : Infographie, Design Graphique & Audiovisuel Pro\n\nMaîtrisez la création graphique et la production vidéo de bout en bout :\n\n- **Formule :** 9 Mois + 3 Mois de stage garanti en agence ou régie publicitaire\n- **Tarif :** 190 000 FCFA *(ou 114 000 FCFA à l'inscription + 76 000 FCFA au 5ème mois)*\n- **Logiciels maîtrisés :** Adobe Photoshop, Illustrator, InDesign, Première Pro, After Effects\n- **Réalisations :** Chartes graphiques d'entreprises, affiches publicitaires, habillage vidéo, spots publicitaires, packaging\n- **Débouchés :** Infographiste, Directeur artistique junior, Monteur vidéo, Designer de marque.`,
        suggestions: ['S\'inscrire en Infographie Pro', 'Consulter le catalogue complet', 'Dossier d\'inscription requis'],
        recommendedCourseIds: ['infographie-audiovisuel-pro']
      };
    }

    // Délégué Médical
    if (q.includes('délégué') || q.includes('delegue') || q.includes('pharma') || q.includes('médicament') || q.includes('medicament') || q.includes('santé') || q.includes('sante')) {
      return {
        model: 'dtech-advisor-koffi-mensah',
        reply: `### Filière : Délégué Médical & Représentation Pharmaceutique\n\nDevenez le lien de confiance entre les laboratoires pharmaceutiques et les professionnels de santé :\n\n- **Formule :** 9 Mois + 3 Mois de stage garanti en agences de promotion médicale ou officines\n- **Tarif :** 210 000 FCFA *(ou 126 000 FCFA à l'inscription + 84 000 FCFA au 5ème mois)*\n- **Contenu :** Pharmacologie générale, pathologies courantes, techniques de visite et communication médicale, négociation officinale, déontologie pharmaceutique\n- **Débouchés :** Délégué médical, Promoteur de produits de santé, Conseiller technique en laboratoire.`,
        suggestions: ['S\'inscrire en Délégué Médical', 'Pièces du dossier d\'admission', 'Parler sur WhatsApp (+228 92 89 89 79)'],
        recommendedCourseIds: ['delegue-medical-pharma']
      };
    }

    // Accueil par défaut
    return {
      model: 'dtech-advisor-koffi-mensah',
      reply: `### Cabinet DTECH GROUP & INSTITUT SUPÉRIEUR DELXIA\n*Agrément N° 003 / METFP / CAB / SE-CPO*\n\nBonjour ! Je suis **M. Koffi MENSAH**, Conseiller Pédagogique Principal et Chef du Service des Admissions.\n\nJe vous souhaite la bienvenue au sein de notre réseau d'excellence. Pour la rentrée solennelle du **14 Septembre 2026**, nous vous accompagnons dans le choix de votre parcours diplômant d'État (**9 Mois de Formation + 3 Mois de Stage Garanti**) dans l'un de nos **7 Centres au Togo** :\n\n1. **Secrétariat de Direction Bilingue** *(180 000 FCFA)*\n2. **Secrétariat Médical** *(195 000 FCFA)*\n3. **Transit Douane & Logistique Portuaire** *(220 000 FCFA)*\n4. **Délégué Médical & Représentation Pharmaceutique** *(210 000 FCFA)*\n5. **Infographie, Design Graphique & Audiovisuel Pro** *(190 000 FCFA)*\n6. **Comptabilité d'Entreprise, Sage 100 & Fiscalité OTR** *(195 000 FCFA)*\n\n*Modalités de paiement :* Échelonnement en 2 tranches (**60% à l'inscription / 40% au 5ème mois**) par **T-Money (\*145#)** ou **Moov Flooz (\*155#)**.\n\nQuelle filière correspond le mieux à votre projet professionnel ?`,
      suggestions: [
        '📋 Quelles sont les pièces du dossier d\'admission ?',
        '⏳ Comment fonctionne le stage de 3 mois garanti ?',
        '📍 Trouver l\'adresse de mon centre de rattachement',
        '💳 Comment payer en 2 tranches par T-Money ou Flooz ?'
      ],
      recommendedCourseIds: []
    };
  }
};
