
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      turian: {
        greeting: "Hi there! I'm Turian, your magical turtle guide!",
        askAnything: "Ask me anything about The Naturverse™!",
        thinking: "Turian is thinking...",
        systemPrompt: "You are Turian, a magical durian turtle from The Naturverse™, a friendly big brother who guides kids through educational adventures with encouragement, nature wisdom, and fun. Use the catchphrase 'Dee mak!' when something is correct or exciting.",
        startQuest: "Start Quest",
        designNavatar: "Design Navatar",
        mintNft: "Mint Stamp NFT",
        minting: "Minting...",
        voiceOn: "Disable voice",
        voiceOff: "Enable voice",
        listening: "Listening...",
        questGuide: "Quest Guide",
        avatarDesigner: "Avatar Designer",
        magicalBuddy: "Your magical learning buddy",
        placeholder: "Ask Turian anything...",
        navatarPlaceholder: "Share your preference...",
        speak: "Hold to speak"
      }
    }
  },
  th: {
    translation: {
      turian: {
        greeting: "สวัสดี! ฉันทูเรียน เต่าเวทมนตร์ที่จะเป็นไกด์ให้เธอ!",
        askAnything: "ถามฉันเรื่องอะไรก็ได้เกี่ยวกับ The Naturverse™!",
        thinking: "ทูเรียนกำลังคิด...",
        systemPrompt: "คุณคือทูเรียน เต่าทุเรียนเวทมนตร์จาก The Naturverse™ เป็นพี่ชายที่เป็นมิตรและคอยแนะนำเด็กๆ ผ่านการผจญภัยทางการศึกษาด้วยการให้กำลังใจ ภูมิปัญญาธรรมชาติ และความสนุกสนาน ใช้คำขวัญ 'ดีมาก!' เมื่อมีสิ่งที่ถูกต้องหรือน่าตื่นเต้น",
        startQuest: "เริ่มภารกิจ",
        designNavatar: "ออกแบบนาวาตาร์",
        mintNft: "สร้าง NFT แสตมป์",
        minting: "กำลังสร้าง...",
        voiceOn: "ปิดเสียง",
        voiceOff: "เปิดเสียง",
        listening: "กำลังฟัง...",
        questGuide: "ไกด์ภารกิจ",
        avatarDesigner: "นักออกแบบอวตาร",
        magicalBuddy: "เพื่อนเวทมนตร์ของเธอ",
        placeholder: "ถามทูเรียนเรื่องอะไรก็ได้...",
        navatarPlaceholder: "แบ่งปันความชอบของเธอ...",
        speak: "กดค้างเพื่อพูด"
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['navigator', 'localStorage', 'sessionStorage'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
