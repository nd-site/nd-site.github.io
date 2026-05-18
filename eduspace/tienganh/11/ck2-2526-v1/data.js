// data.js – KIỂM TRA CUỐI KÌ II – TIẾNG ANH 11 (GLOBAL SUCCESS) – 2025-2026
// Chương trình GDPT 2018 | Sách Global Success
// Nội dung: Units 6 - 10 (Preserving our heritage, Education in the future, Becoming independent, Social issues, The ecosystem)
// 28 câu TN (×0,25đ = 7đ) + 3 câu TL (×1đ = 3đ) | 60 phút

window.quizData = {
    title: "Kiểm tra Cuối Học Kì II – Tiếng Anh 11 (Global Success) 2025-2026",
    config: {
        testDuration: 3600, // 60 phút
        examLayout: {
            multiple: { count: 28, pointsPerQ: 0.25 },
            essay: { count: 3, pointsPerQ: 1.0 }
        }
    },
    questions: [
        // ── PHONETICS ──────────────────────────────────────────────
        {
            type: "multiple",
            question: "Choose the word whose underlined part is pronounced differently from the others.",
            options: ["<u style='text-decoration: underline'>h</u>eritage", "<u style='text-decoration: underline'>h</u>onest", "<u style='text-decoration: underline'>h</u>abitat", "<u style='text-decoration: underline'>h</u>ealthy"],
            correct: 1,
            explanation: "The 'h' in 'honest' is silent. The others are pronounced /h/."
        },
        {
            type: "multiple",
            question: "Choose the word whose underlined part is pronounced differently from the others.",
            options: ["r<u style='text-decoration: underline'>e</u>store", "pr<u style='text-decoration: underline'>e</u>serve", "d<u style='text-decoration: underline'>e</u>pend", "f<u style='text-decoration: underline'>e</u>stival"],
            correct: 3,
            explanation: "The 'e' in festival is pronounced /e/. In the others, it is pronounced /ɪ/."
        },
        {
            type: "multiple",
            question: "Choose the word that has a different stress pattern from the others.",
            options: ["independent", "academic", "vocational", "education"],
            correct: 2,
            explanation: "vocational has stress on the 2nd syllable /vəʊˈkeɪ.ʃən.əl/. The others have primary stress on the 3rd syllable."
        },
        {
            type: "multiple",
            question: "Choose the word that has a different stress pattern from the others.",
            options: ["protect", "damage", "restore", "preserve"],
            correct: 1,
            explanation: "damage has stress on the 1st syllable. The others have stress on the 2nd syllable."
        },
        // ── VOCABULARY & GRAMMAR ────────────────────────────────────
        {
            type: "multiple",
            question: "Choose the best answer: Being ________ means you are capable of doing things by yourself without relying on others.",
            options: ["dependent", "independent", "reliable", "decisive"],
            correct: 1,
            explanation: "'independent' means not relying on others (độc lập)."
        },
        {
            type: "multiple",
            question: "Choose the best answer: In the future, students will use more digital ________ to support their learning.",
            options: ["applications", "schools", "teachers", "classrooms"],
            correct: 0,
            explanation: "'digital applications' (ứng dụng kỹ thuật số) fits the context of future learning tools."
        },
        {
            type: "multiple",
            question: "Choose the best answer: Deforestation has caused serious ________ to the natural habitats of many endangered species.",
            options: ["benefit", "protection", "damage", "improvement"],
            correct: 2,
            explanation: "'cause damage to' means gây thiệt hại cho."
        },
        {
            type: "multiple",
            question: "Choose the best answer: We ________ a lot of time preparing for the cultural festival last week.",
            options: ["spend", "have spent", "were spending", "spent"],
            correct: 3,
            explanation: "Past simple is used for an action completed in the past ('last week')."
        },
        {
            type: "multiple",
            question: "Choose the best answer: The old pagoda ________ to its original beauty by the local authorities recently.",
            options: ["has been restored", "restored", "has restored", "was restoring"],
            correct: 0,
            explanation: "Present perfect passive is required here ('recently')."
        },
        {
            type: "multiple",
            question: "Choose the best answer: Bullying is a serious ________ issue that needs to be addressed immediately in schools.",
            options: ["social", "environmental", "economic", "historical"],
            correct: 0,
            explanation: "Bullying is a 'social issue' (vấn đề xã hội)."
        },
        {
            type: "multiple",
            question: "Choose the best answer: ________ having a well-paid job, he isn't satisfied with his life.",
            options: ["Although", "Despite", "Because", "Because of"],
            correct: 1,
            explanation: "'Despite' is followed by a V-ing or Noun phrase, expressing concession."
        },
        {
            type: "multiple",
            question: "Choose the best answer: The teacher advised us ________ more time reading books rather than playing video games.",
            options: ["to spend", "spending", "spend", "spent"],
            correct: 0,
            explanation: "advise sb to do sth (khuyên ai làm gì)."
        },
        {
            type: "multiple",
            question: "Choose the best answer: By the time we arrived at the concert, the band ________ their performance.",
            options: ["finished", "was finishing", "has finished", "had finished"],
            correct: 3,
            explanation: "Past perfect (had finished) is used for an action that happened before another action in the past."
        },
        {
            type: "multiple",
            question: "Choose the closest meaning to the underlined word: It is CRUCIAL to protect biodiversity for the survival of our planet.",
            options: ["unimportant", "necessary", "optional", "easy"],
            correct: 1,
            explanation: "'crucial' means extremely important or necessary."
        },
        {
            type: "multiple",
            question: "Choose the opposite meaning to the underlined word: Time-management skills are ESSENTIAL for students to become independent learners.",
            options: ["important", "necessary", "unnecessary", "vital"],
            correct: 2,
            explanation: "The opposite of 'essential' (cần thiết) is 'unnecessary'."
        },
        {
            type: "multiple",
            question: "Identify the error: Having(A) studied hard(B) for the exam, she(C) passed it easy(D).",
            options: ["Having", "hard", "she", "easy"],
            correct: 3,
            explanation: "'easy' must be changed to the adverb 'easily' to modify the verb 'passed'."
        },
        {
            type: "multiple",
            question: "Identify the error: The man(A) who(B) I was talking to(C) him(D) is my new teacher.",
            options: ["The man", "who", "was talking to", "him"],
            correct: 3,
            explanation: "'him' is redundant because 'who/whom' already replaces the object pronoun."
        },
        {
            type: "multiple",
            question: "Choose the best answer: To reduce carbon footprint, people are encouraged to use ________ energy sources like solar and wind power.",
            options: ["fossil", "renewable", "exhausted", "polluting"],
            correct: 1,
            explanation: "Solar and wind power are 'renewable' energy sources."
        },
        {
            type: "multiple",
            question: "Choose the best answer: ________ from the university, she started looking for a job in a non-governmental organisation.",
            options: ["Graduate", "Graduated", "Having graduated", "To graduate"],
            correct: 2,
            explanation: "Perfect participle (Having + V3/ed) is used to emphasize that one action happened before another."
        },
        {
            type: "multiple",
            question: "Choose the best answer: Parents should encourage their children to be more ________ by letting them make their own decisions.",
            options: ["dependent", "independent", "relied", "confident"],
            correct: 1,
            explanation: "making their own decisions makes children more 'independent'."
        },
        // ── READING ───────────────────────────────────────────────────
        {
            type: "multiple",
            question: "Read the passage and choose the correct answer: Peer pressure is one of the most common social issues among teenagers. It happens when you are influenced by other people of your own age to act in a certain way so that you can fit in or be accepted. While peer pressure can sometimes be positive, pushing you to try harder in your studies, it is often negative, leading teenagers to engage in risky behaviors such as skipping classes or trying harmful substances.\n\nWhat is peer pressure according to the passage?",
            options: ["A physical illness", "Influence from parents", "Influence from people of the same age", "A school subject"],
            correct: 2,
            explanation: "The passage says it happens when you are influenced by other people of your own age."
        },
        {
            type: "multiple",
            question: "According to the passage, negative peer pressure can lead teenagers to do what?",
            options: ["Study harder", "Engage in risky behaviors", "Help their parents", "Become independent"],
            correct: 1,
            explanation: "The passage states negative peer pressure leads teenagers to 'engage in risky behaviors'."
        },
        {
            type: "multiple",
            question: "Choose the best response: 'I think we should organize a campaign to clean up the local park.'",
            options: ["That's a great idea!", "I don't like parks.", "Yes, we shouldn't.", "You are welcome."],
            correct: 0,
            explanation: "'That's a great idea!' is an enthusiastic expression of agreement."
        },
        {
            type: "multiple",
            question: "Choose the best response: 'How about using public transport instead of motorbikes?'",
            options: ["No, thanks.", "Yes, I agree. It helps reduce air pollution.", "I'm fine, thank you.", "It's my pleasure."],
            correct: 1,
            explanation: "Agreeing to a suggestion with a supportive reason."
        },
        {
            type: "multiple",
            question: "Choose the best word to fill in the blank: Ecosystems are very sensitive. If one species ________ extinct, it can affect the whole food chain.",
            options: ["becomes", "makes", "does", "takes"],
            correct: 0,
            explanation: "The correct collocation is 'become extinct' (tuyệt chủng)."
        },
        {
            type: "multiple",
            question: "Choose the best word to fill in the blank: Cultural heritage sites should be preserved ________ future generations can learn about their history.",
            options: ["because", "so that", "although", "in order to"],
            correct: 1,
            explanation: "'so that' + clause indicates purpose."
        },
        {
            type: "multiple",
            question: "Choose the best answer: She denied ________ the school rules during the exam.",
            options: ["to break", "breaking", "broken", "break"],
            correct: 1,
            explanation: "deny + V-ing (phủ nhận đã làm gì)."
        },
        {
            type: "multiple",
            question: "Choose the best answer: After leaving high school, many students choose to pursue higher ________ at universities.",
            options: ["education", "knowledge", "career", "study"],
            correct: 0,
            explanation: "'higher education' (giáo dục đại học) is the standard collocation."
        },
        // ── TỰ LUẬN (WRITING) ──────────────────────────────────────────────
        {
            type: "essay",
            question: "Rewrite the sentence so that it means the same as the first one, using the word(s) given:\n1. \"You should take a gap year before going to university,\" the teacher said to Nam.\n-> The teacher advised ________________________________________.",
            suggested: "The teacher advised Nam to take a gap year before going to university.",
            points: 25,
            explanation: "AI chấm: Sử dụng cấu trúc advised sb to do sth chính xác."
        },
        {
            type: "essay",
            question: "Rewrite the sentence using a Participle Clause (Present, Past or Perfect Participle):\n2. Because he had finished all his assignments, he went out with his friends.\n-> ___________________________________________________________.",
            suggested: "Having finished all his assignments, he went out with his friends.",
            points: 25,
            explanation: "AI chấm: Rút gọn mệnh đề trạng ngữ bằng phân từ hoàn thành (Having V3/ed) vì hành động xảy ra trước."
        },
        {
            type: "essay",
            question: "Write a short paragraph (about 100 - 120 words) suggesting two or three ways to preserve local cultural heritage.",
            suggested: "Preserving local cultural heritage is vital for maintaining our identity, and there are several ways we can do this. First, education plays a crucial role. Schools should include local history and traditional arts in their curriculum so that younger generations can understand and appreciate their heritage. Second, the government and local authorities should invest money in restoring historical sites and old buildings that are degrading. Finally, promoting traditional festivals and crafts through tourism can help keep these practices alive while providing income for local artisans. By working together, we can ensure that our cultural heritage is passed down to future generations.",
            points: 50,
            explanation: "AI chấm điểm dựa trên cấu trúc đoạn văn, nêu được 2-3 cách bảo tồn di sản (giáo dục, trùng tu, quảng bá du lịch), lập luận logic, ngữ pháp chính xác."
        }
    ]
};
