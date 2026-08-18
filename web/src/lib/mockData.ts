import { VocabularyItem, Deck, Folder, GrammarExercise, UserProfile } from './types';

export const MOCK_PROFILE: UserProfile = {
  id: 'usr_1001',
  fullName: 'Huỳnh Phát',
  email: '031041250065@st.buh.edu.vn',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  targetCefr: 'C1 (Advanced)',
  dailyGoal: 20,
  streakDays: 14,
  totalWordsLearned: 384,
  masteryRate: 94,
  bio: 'AI Engineering Student & EdTech Researcher',
  occupation: 'Software Engineer & Researcher',
};

export const MOCK_FOLDERS: Folder[] = [
  { id: 'fld_ext', name: '🔥 Chrome Extension Today', icon: 'Sparkles', deckIds: ['deck_ext_today'] },
  { id: 'fld_1', name: 'Công Nghệ & AI', icon: 'Cpu', deckIds: ['deck_1', 'deck_4'] },
  { id: 'fld_2', name: 'IELTS Academic 8.0', icon: 'GraduationCap', deckIds: ['deck_2'] },
  { id: 'fld_3', name: 'Tài Liệu Scan AI', icon: 'FileText', deckIds: ['deck_3'] },
];

export const TODAY_EXTENSION_DECK: Deck = {
  id: 'deck_ext_today',
  title: '🔥 Chrome Extension Today',
  description: 'Từ vựng bạn vừa bôi đen tra bằng Extension hôm nay (Đã đồng bộ FSRS)',
  folderId: 'fld_ext',
  category: 'Scan AI',
  totalWords: 7,
  masteredWords: 3,
  lastStudied: 'Vừa đồng bộ',
  color: 'from-amber-500 to-indigo-600',
  iconName: 'Sparkles',
};

export const MOCK_DECKS: Deck[] = [
  TODAY_EXTENSION_DECK,
  {
    id: 'deck_1',
    title: 'AI & Machine Learning Core',
    description: 'Từ vựng chuyên ngành Trí tuệ nhân tạo, Transformer & LLM Frameworks',
    folderId: 'fld_1',
    category: 'Tech & AI',
    totalWords: 24,
    masteredWords: 18,
    lastStudied: '2 giờ trước',
    color: 'from-indigo-600 to-blue-500',
    iconName: 'Cpu',
  },
  {
    id: 'deck_2',
    title: 'IELTS Band 8.0 Vocabulary',
    description: 'Các từ vựng C1/C2 nâng cao thường xuất hiện trong Reading & Writing Task 2',
    folderId: 'fld_2',
    category: 'IELTS',
    totalWords: 35,
    masteredWords: 29,
    lastStudied: 'Hôm qua',
    color: 'from-emerald-600 to-teal-500',
    iconName: 'Sparkles',
  },
  {
    id: 'deck_3',
    title: 'Scan Paper: DeepSeek R1 Architecture',
    description: 'Từ vựng & cấu trúc trích xuất từ bài báo khoa học DeepSeek-R1 Technical Report',
    folderId: 'fld_3',
    category: 'Scan AI',
    totalWords: 16,
    masteredWords: 10,
    lastStudied: '3 ngày trước',
    color: 'from-amber-600 to-orange-500',
    iconName: 'FileSearch',
  },
  {
    id: 'deck_4',
    title: 'Distributed Systems & Cloud',
    description: 'Thuật ngữ hệ thống phân tán, Load balancing & Microservices architecture',
    folderId: 'fld_1',
    category: 'Tech & AI',
    totalWords: 20,
    masteredWords: 14,
    lastStudied: '5 ngày trước',
    color: 'from-purple-600 to-pink-500',
    iconName: 'Server',
  },
];

export const TODAY_EXTENSION_VOCABULARY: VocabularyItem[] = [
  {
    id: 'ext_v1',
    term: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    translation: 'Kiên cường, có khả năng phục hồi nhanh chóng',
    cefrLevel: 'C1',
    partOfSpeech: 'adjective',
    exampleSentence: 'The system design is highly resilient to server outages and network latency.',
    exampleTranslation: 'Thiết kế hệ thống có khả năng chống chịu rất cao trước các sự cố sập server và độ trễ mạng.',
    tags: ['Extension Today', 'C1'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 7.2, difficulty: 4.1, repetition: 4, lapses: 0, nextReviewDate: '2026-08-16' },
  },
  {
    id: 'ext_v2',
    term: 'ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    translation: 'Phù du, ngắn ngủi, tạm thời',
    cefrLevel: 'C2',
    partOfSpeech: 'adjective',
    exampleSentence: 'FSRS stores state in ephemeral memory before committing to Supabase.',
    exampleTranslation: 'FSRS lưu trạng thái trong bộ nhớ tạm thời trước khi ghi vào Supabase.',
    tags: ['Extension Today', 'C2'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 3.5, difficulty: 6.8, repetition: 2, lapses: 1, nextReviewDate: '2026-08-14' },
  },
  {
    id: 'ext_v3',
    term: 'inference latency',
    phonetic: '/ˈɪn.fər.əns ˈleɪ.tən.si/',
    translation: 'Độ trễ suy luận (thời gian AI phản hồi)',
    cefrLevel: 'C1',
    partOfSpeech: 'noun phrase',
    exampleSentence: 'Optimizing inference latency is crucial for real-time translation extensions.',
    exampleTranslation: 'Tối ưu độ trễ suy luận là yếu tố quyết định cho extension dịch thuật.',
    tags: ['Extension Today', 'AI'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 8.5, difficulty: 4.0, repetition: 5, lapses: 0, nextReviewDate: '2026-08-19' },
  },
  {
    id: 'ext_v4',
    term: 'paradigm shift',
    phonetic: '/ˈpær.ə.daɪm ʃɪft/',
    translation: 'Sự thay đổi mô hình, bước ngoặt tư duy',
    cefrLevel: 'C2',
    partOfSpeech: 'noun phrase',
    exampleSentence: 'Large Language Models mark a fundamental paradigm shift.',
    exampleTranslation: 'Các Mô hình Ngôn ngữ Lớn đánh dấu một bước ngoặt tư duy căn bản.',
    tags: ['Extension Today', 'Tech'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 5.0, difficulty: 5.2, repetition: 3, lapses: 0, nextReviewDate: '2026-08-17' },
  },
  {
    id: 'ext_v5',
    term: 'scrutinize',
    phonetic: '/ˈskruː.tɪ.naɪz/',
    translation: 'Xem xét kỹ lưỡng, mổ xẻ nghiên cứu',
    cefrLevel: 'C1',
    partOfSpeech: 'verb',
    exampleSentence: 'Researchers must scrutinize every experimental result.',
    exampleTranslation: 'Các nhà nghiên cứu phải mổ xẻ kỹ lưỡng mọi kết quả thí nghiệm.',
    tags: ['Extension Today', 'IELTS'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 2.1, difficulty: 7.5, repetition: 1, lapses: 1, nextReviewDate: '2026-08-15' },
  },
  {
    id: 'ext_v6',
    term: 'reinforcement learning',
    phonetic: '/ˌriː.ɪnˈfɔːrs.mənt/',
    translation: 'Học tăng cường (Thuật toán AI nâng cao)',
    cefrLevel: 'C1',
    partOfSpeech: 'noun phrase',
    exampleSentence: 'DeepSeek-R1 utilizes reinforcement learning for reasoning.',
    exampleTranslation: 'DeepSeek-R1 sử dụng học tăng cường để suy luận.',
    tags: ['Extension Today', 'AI'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 6.0, difficulty: 4.5, repetition: 3, lapses: 0, nextReviewDate: '2026-08-18' },
  },
  {
    id: 'ext_v7',
    term: 'fine-tuning',
    phonetic: '/faɪn ˈtuː.nɪŋ/',
    translation: 'Tinh chỉnh mô hình (Huấn luyện bổ sung)',
    cefrLevel: 'C1',
    partOfSpeech: 'noun',
    exampleSentence: 'Supervised fine-tuning prepares the model for downstream tasks.',
    exampleTranslation: 'Tinh chỉnh có giám sát chuẩn bị mô hình cho các tác vụ tiếp theo.',
    tags: ['Extension Today', 'Tech'],
    deckId: 'deck_ext_today',
    fsrs: { stability: 4.2, difficulty: 5.0, repetition: 2, lapses: 0, nextReviewDate: '2026-08-16' },
  },
];

export const INITIAL_VOCABULARY: VocabularyItem[] = [
  ...TODAY_EXTENSION_VOCABULARY,
  {
    id: 'v3',
    term: 'ubiquitous',
    phonetic: '/juːˈbɪk.wə.təs/',
    translation: 'Có mặt ở khắp mọi nơi, phổ biến rộng rãi',
    cefrLevel: 'C1',
    partOfSpeech: 'adjective',
    exampleSentence: 'Mobile devices have become ubiquitous in modern education.',
    exampleTranslation: 'Thiết bị di động đã trở nên phổ biến khắp mọi nơi trong giáo dục hiện đại.',
    tags: ['IELTS', 'Academic'],
    deckId: 'deck_2',
    fsrs: { stability: 12.0, difficulty: 3.0, repetition: 6, lapses: 0, nextReviewDate: '2026-08-20' },
  },
];

export const MOCK_GRAMMAR_EXERCISES: GrammarExercise[] = [
  {
    id: 'g1',
    sentence: 'The research paper ______ by the Gemini AI engine preserved all LaTeX formulas perfectly.',
    translation: 'Bài báo khoa học được dịch bởi công cụ Gemini AI đã giữ nguyên hoàn hảo mọi công thức LaTeX.',
    grammarPoint: 'Reduced Relative Clause (Rút gọn Mệnh đề quan hệ - Thể bị động)',
    explanation: 'Rút gọn mệnh đề quan hệ dạng bị động: "which was translated" ➔ "translated".',
    options: ['translated', 'translating', 'was translated', 'has translated'],
    correctAnswer: 'translated',
  },
  {
    id: 'g2',
    sentence: 'Hardly ______ finished setting up the database when the server received 10,000 translation requests.',
    translation: 'Ngay khi vừa hoàn tất cài đặt cơ sở dữ liệu thì server nhận tới 10,000 yêu cầu dịch.',
    grammarPoint: 'Inversion with Hardly... when (Đảo ngữ với Hardly)',
    explanation: 'Hardly + had + S + V3/ed... when + S + V2/ed (Diễn tả hành động vừa xong thì hành động khác xảy ra).',
    options: ['had the engineer', 'the engineer had', 'has the engineer', 'the engineer has'],
    correctAnswer: 'had the engineer',
  },
  {
    id: 'g3',
    sentence: 'It is essential that every vocabulary item ______ with its appropriate CEFR level tag.',
    translation: 'Điều quan trọng là mỗi từ vựng phải được gắn thẻ cấp độ CEFR phù hợp.',
    grammarPoint: 'Subjunctive Mood (Thức giả định với tính từ essential/important)',
    explanation: 'Cấu trúc giả định: It is essential/important + that + S + (should) V-bare. Ở thể bị động ➔ be + V3.',
    options: ['be tagged', 'is tagged', 'was tagged', 'tagged'],
    correctAnswer: 'be tagged',
  },
];

export const MOCK_SCANNED_MARKDOWN = `# DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning

> **Abstract**: We introduce **DeepSeek-R1-Zero** and **DeepSeek-R1**, first-generation reasoning models trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step.

---

## 1. Introduction & Core Breakthrough

Traditional Large Language Models rely heavily on **Supervised Fine-Tuning (SFT)** with curated human demonstration data. However, **DeepSeek-R1** demonstrates that complex reasoning capability can naturally emerge through pure **Reinforcement Learning (RL)** algorithms.

### Key Performance Benchmarks

| Model | AIME 2024 (Pass@1) | MATH-500 | Codeforces Rating |
| :--- | :--- | :--- | :--- |
| **DeepSeek-R1-Zero** | 71.0% | 86.6% | 1450 |
| **DeepSeek-R1** | **79.8%** | **97.3%** | **2029 (Superior)** |
| **OpenAI o1-mini** | 63.6% | 90.0% | 1820 |

---

## 2. Technical Architecture & FSRS Integration

The model architecture incorporates a multi-stage training pipeline:

1. **Cold-Start SFT**: Fine-tuning on 10,000 high-quality reasoning chains.
2. **Reasoning-Oriented RL**: Utilizing **Group Relative Policy Optimization (GRPO)** to optimize reward scores.
3. **Rejection Sampling**: Filtering low-quality reasoning traces.

\`\`\`python
# Example FSRS Spaced Repetition Scheduling Algorithm Wrapper
def calculate_next_review(stability: float, difficulty: float, rating: int) -> float:
    """
    FSRS-4.5 Algorithm Implementation
    rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    """
    factor = 1.0 + (rating - 3) * 0.15
    new_stability = stability * (1.0 + math.exp(difficulty) * factor)
    return round(new_stability, 2)
\`\`\`

> 💡 **Key Takeaway**: By combining Deep NLP Dissection with **Orbit Translate's FSRS algorithm**, users remember complex academic terminology **5x faster** than traditional handwritten flashcards.
`;
