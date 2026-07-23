export const weddingContent = {
  guestFallbackName: "ភ្ញៀវកិត្តិយស",
  invitation: {
    auspiciousTitle: "សិរីសួស្តីអាពាហ៍ពិពាហ៍",
    invitePrefix: "សូមគោរពអញ្ជើញ",
    groomSide: "ខាងកូនប្រុស",
    brideSide: "ខាងកូនស្រី",
    formalLine: "មានកិត្តិយសសូមគោរពអញ្ជើញ",
    witnessLine: "ដើម្បីចូលរួមជាអធិបតីភាព និងជាសាក្សីដ៏ឧត្តុង្គឧត្តម",
    banquetLine: "ក្នុងពិធីពិសាភោជនាហារអាពាហ៍ពិពាហ៍",
    groomName: "អ៊ុំ មាណិត",
    brideName: "មុី ស្រីពេជ្រតា",
    unionText: "និង",
  },
  // Replace the bracketed values once the ceremony details are confirmed.
  eventSummary: {
    dateLabel: "កាលបរិច្ឆេទ",
    date: "[ថ្ងៃ ខែ ឆ្នាំ]",
    timeLabel: "ពេលវេលា",
    time: "[ម៉ោងកម្មវិធីសំខាន់]",
    locationLabel: "ទីតាំង",
    location: "[ឈ្មោះទីតាំង និងអាសយដ្ឋានពេញលេញ]",
    mapButton: "បើកផែនទី Google",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%5B%E1%9E%91%E1%9E%B8%E1%9E%8F%E1%9E%B6%E1%9F%86%E1%9E%84%5D",
  },
  // English invitation placeholders: update these independently from the Khmer invitation above.
  englishInvitation: {
    title: "Auspicious Wedding Ceremony",
    invitationLine: "With joyful hearts, we invite you to celebrate the wedding of",
    groomLabel: "GROOM",
    groomName: "Manith",
    brideLabel: "BRIDE",
    brideName: "Pichta",
    unionText: "&",
    formalLine: "Your presence will add great joy to our wedding celebration.",
    dateLabel: "WEDDING DATE",
    date: "[Date to be confirmed]",
    timeLabel: "MAIN EVENT TIME",
    time: "[Time to be confirmed]",
    locationLabel: "LOCATION",
    location: "[Full venue name and address]",
    mapButton: "Open in Google Maps",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%5BVenue%5D",
  },
  agenda: {
    kicker: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
    heading: "របៀបវារៈកម្មវិធី",
    note: "សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយស អញ្ជើញចូលរួមតាមពេលវេលាខាងក្រោម",
    items: [
      { time: "០៦:០០ ព្រឹក", title: "ពិធីហែជំនួន", iconAsset: "wedding.agenda-jomnun" },
      { time: "០៨:០០ ព្រឹក", title: "ពិធីទទួលភ្ញៀវ និងជួបជុំក្រុមគ្រួសារ", iconAsset: "wedding.agenda-phneav" },
      { time: "០៩:០០ ព្រឹក", title: "ពិធីសែនព្រេន", detail: "សូមអញ្ជើញចូលរួមប្រសិទ្ធពរ", iconAsset: "wedding.agenda-senpren" },
      { time: "០៩:៣០ ព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", detail: "និងពិធីផ្សំពាក្យ", iconAsset: "wedding.agenda-jenjean" },
      { time: "១០:០០ ព្រឹក", title: "ពិធីបង្កក់សិរី", detail: "ជូនដល់កូនប្រុស កូនស្រី", iconAsset: "wedding.agenda-bongkokserei" },
      { time: "១០:៣០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", iconAsset: "wedding.agenda-katsok" },
      { time: "១១:០០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម", detail: "ប្រសិទ្ធពរជ័យមង្គល", iconAsset: "wedding.agenda-ptim" },
      { time: "១២:០០ ថ្ងៃត្រង់", title: "ពិសាអាហារថ្ងៃត្រង់", iconAsset: "wedding.agenda-aha" },
      { time: "០៥:០០ ល្ងាច", title: "ទទួលភ្ញៀវកិត្តិយស និងពិសាអាហារ", detail: "អមដោយតន្ត្រី និងកម្មវិធីរាំលេងកម្សាន្ត", iconAsset: "wedding.agenda-ahalgeach" },
    ],
  },
  venue: {
    title: "ទីតាំងប្រារព្ធពិធី",
    hallLabel: "សាលប្រារព្ធពិធី",
    name: "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍អន្តរជាតិជ្រោយចង្វារ",
    building: "អគារ G និង H",
    mapLabel: "ផែនទីផ្លូវធ្វើដំណើរ",
    mapButton: "បើកផែនទី",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Chroy%20Changvar%20International%20Convention%20and%20Exhibition%20Center",
  },
  gallery: {
    title: "កម្រងរូបភាពអនុស្សាវរីយ៍",
    subtitle: "ស្នាមញញឹមនៃក្តីស្រលាញ់",
    moreLabel: "មើលរូបភាពបន្ថែម",
    // Real photos go here: paste a Cloudinary publicId per slot. An empty string
    // renders a placeholder box (structure holds until the photo is uploaded).
    // Slots in visual order: top cap → m1..m6 masonry → bottom cap.
    // See .agents/photo-gallery-engine.md.
    slots: {
      top: "", // wide opening banner (2.4:1)
      m1: "", //  tall portrait
      m2: "", //  tall portrait
      m3: "", //  square
      m4: "", //  square
      m5: "", //  landscape
      m6: "", //  landscape
      bottom: "", // wide closing banner (2.4:1)
    } as Record<string, string>,
  },
  footer: {
    title: "សេចក្តីថ្លែងអំណរគុណ",
    gratitudeLineOne: "វត្តមានដ៏ខ្ពង់ខ្ពស់របស់លោកអ្នក",
    gratitudeLineTwo: "គឺជាកិត្តិយសដ៏ឧត្តុង្គឧត្តមសម្រាប់គ្រួសារយើងខ្ញុំ",
    credit: "រៀបចំឡើងដោយក្តីស្រលាញ់",
  },
};
