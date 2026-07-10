export const weddingContent = {
  guestFallbackName: "ភ្ញៀវកិត្តិយស",
  invitation: {
    auspiciousTitle: "សិរីសួស្តីអាពាហ៍ពិពាហ៍",
    invitePrefix: "សូមគោរពអញ្ជើញ",
    groomSide: "ខាងកូនប្រុស",
    brideSide: "ខាងកូនស្រី",
    fatherTitle: "លោក / មហាឧបាសក",
    motherTitle: "លោកស្រី / មហាឧបាសិកា",
    groomFatherName: "ឈ្មោះឪពុកខាងកូនប្រុស",
    groomMotherName: "ឈ្មោះម្តាយខាងកូនប្រុស",
    brideFatherName: "ឈ្មោះឪពុកខាងកូនស្រី",
    brideMotherName: "ឈ្មោះម្តាយខាងកូនស្រី",
    formalLine: "មានកិត្តិយសសូមគោរពអញ្ជើញ",
    witnessLine: "ដើម្បីចូលរួមជាអធិបតីភាព និងជាសាក្សីដ៏ឧត្តុង្គឧត្តម",
    banquetLine: "ក្នុងពិធីពិសាភោជនាហារអាពាហ៍ពិពាហ៍",
    groomName: "ឈ្មោះកូនប្រុស",
    brideName: "ឈ្មោះកូនស្រី",
    unionText: "និង",
  },
  agenda: {
    title: "របៀបវារៈកម្មវិធី",
    morningTitle: "ពេលព្រឹក",
    eveningTitle: "ពេលល្ងាច",
    morningItems: [
      { time: "០៧:០០ ព្រឹក", label: "ពិធីហែជំនូន" },
      { time: "០៨:០០ ព្រឹក", label: "ពិធីកាត់សក់បង្កក់សិរី" },
      { time: "១០:០០ ព្រឹក", label: "ពិធីសែនព្រេន និងចងដៃ" },
      { time: "១១:៣០ ព្រឹក", label: "ពិធីព្រះសង្ឃសូត្រមន្ត" },
    ],
    eveningItems: [
      { time: "០៤:០០ ល្ងាច", label: "ទទួលភ្ញៀវកិត្តិយស" },
      { time: "០៦:០០ ល្ងាច", label: "ពិធីពិសាភោជនាហារ និងរាំលេងកម្សាន្ត" },
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
