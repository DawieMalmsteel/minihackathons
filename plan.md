# PLAN CHI TIẾT – AI Roast My CV (MVP trong 1 buổi chiều)

## 0) Mục tiêu sản phẩm
Xây dựng web app cho phép người dùng upload CV (PDF) + nhập vị trí mục tiêu (ví dụ: `Backend Intern`) để nhận phản hồi AI gồm:

1. **Điểm CV tổng** (0–100)
2. **Điểm mạnh** (3–5 ý)
3. **Điểm yếu chính** (3–5 ý)
4. **ATS keywords còn thiếu** theo role mục tiêu
5. **Gợi ý viết lại theo section** (Summary, Experience, Projects, Skills)

> Tiêu chí hackathon: chạy ổn định, UX mượt, phản hồi rõ ràng, demo trong 2–3 phút là thuyết phục.

---

## 1) Scope MVP (bắt buộc)

### Input
- CV PDF (1 file)
- Target role (text input)
- Optional level (Intern/Fresher/Junior)

### Output
- Score + bảng phân tích theo rubric
- Strengths / Weaknesses
- Missing Keywords
- Rewrite Suggestions theo 4 section

### Không làm trong MVP (để tránh trễ)
- Không OCR cho ảnh scan quá xấu
- Không multi-file CV
- Không auth/login
- Không history database
- Không export PDF report (để phase 2)

---

## 2) Tech stack đề xuất

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **UI**: TailwindCSS
- **PDF parsing**: `pdf-parse` (nhanh) hoặc `pdfjs-dist`
- **LLM**: OpenAI hoặc Gemini API
- **Validation**: zod
- **Deploy**: Vercel

### Packages dự kiến
- `openai` hoặc SDK Gemini
- `pdf-parse`
- `zod`
- `clsx` (optional)
- `lucide-react` (optional icon)

---

## 3) Kiến trúc thư mục

```txt
/app
  /api
    /analyze
      route.ts            # nhận cv text + role, gọi LLM, trả JSON
  page.tsx                # upload + nhập role + hiển thị kết quả
/components
  UploadForm.tsx
  ScoreCard.tsx
  AnalysisSections.tsx
  LoadingState.tsx
/lib
  parsePdf.ts             # utility parse PDF -> raw text
  prompt.ts               # system prompt + rubric + output schema yêu cầu
  types.ts                # kiểu dữ liệu response
  validators.ts           # zod schema input/output
plan.md
```

---

## 4) Data contract (response JSON chuẩn)

```json
{
  "score": 78,
  "rubric": {
    "clarity": 15,
    "relevance": 18,
    "impact": 14,
    "ats": 17,
    "language": 14
  },
  "strengths": [
    "..."
  ],
  "weaknesses": [
    "..."
  ],
  "missingKeywords": [
    "Node.js",
    "REST API"
  ],
  "rewriteSuggestions": {
    "summary": "...",
    "experience": "...",
    "projects": "...",
    "skills": "..."
  },
  "overallAdvice": "..."
}
```

---

## 5) Rubric chấm điểm (100 điểm)

- **Clarity & Structure**: 20
  - format rõ, section hợp lý, dễ đọc
- **Relevance to Target Role**: 25
  - nội dung có bám role người dùng nhập không
- **Quantified Impact**: 20
  - có số liệu/metric (%, users, latency, revenue...)
- **ATS Friendliness**: 20
  - từ khóa kỹ thuật, chuẩn section, tránh format khó parse
- **Language Quality**: 15
  - grammar, wording, action verbs

---

## 6) Prompt strategy (bắt model trả JSON)

### System prompt nguyên tắc
- Đóng vai CV reviewer nghiêm khắc nhưng xây dựng
- Chấm theo rubric cố định
- Trả output **JSON hợp lệ** theo schema
- Không thêm text ngoài JSON

### User prompt truyền vào
- CV text đã parse
- target role
- level (nếu có)
- yêu cầu keyword missing theo role

### Chống output lỗi
- Dùng `response_format` (nếu model hỗ trợ JSON schema)
- Nếu parse JSON fail: retry 1 lần với prompt “Return valid JSON only”

---

## 7) Luồng xử lý chi tiết

1. User upload PDF + nhập role
2. Frontend gửi `FormData` đến `/api/analyze`
3. API:
   - validate input
   - parse PDF -> text
   - nếu text quá ngắn thì báo lỗi “CV không đọc được”
   - gọi LLM với prompt chuẩn
   - validate JSON output bằng zod
4. API trả JSON
5. Frontend render:
   - Score card + rubric breakdown
   - strengths / weaknesses
   - missing keywords
   - rewrite suggestions + nút copy

---

## 8) Validation & error handling

### Client-side
- Chỉ nhận `.pdf`
- File size <= 5MB
- target role bắt buộc

### Server-side
- Validate MIME + size
- Nếu PDF parse lỗi -> trả lỗi thân thiện
- Timeout LLM (20–30s)
- Retry 1 lần khi lỗi format JSON

### Error message mẫu
- `Không đọc được nội dung PDF. Vui lòng thử file text-based PDF khác.`
- `Phân tích đang quá tải. Vui lòng thử lại sau 30 giây.`

---

## 9) UI/UX plan (để có “wow”)

### Màn hình chính
- Header: “AI Roast My CV”
- Form trái: upload + target role
- Result phải: score + phân tích

### Trạng thái
- Idle: hướng dẫn + example role
- Loading: skeleton + message “Analyzing your CV…”
- Success: cards màu rõ ràng
- Error: alert đỏ + cách khắc phục

### Chi tiết tạo wow
- Thanh progress score màu đỏ/vàng/xanh
- Badge “ATS ready / Needs work”
- Highlight 5 keyword thiếu đầu tiên
- Button copy từng section rewrite

---

## 10) Kế hoạch thực thi theo thời gian (4.5–5 giờ)

## Block A (0:00–0:45) – Setup dự án
- Tạo project Next.js + Tailwind + TypeScript
- Tạo UI form upload cơ bản
- Tạo API route rỗng `/api/analyze`

**Deliverable:** app chạy local, submit form được.

## Block B (0:45–1:30) – Parse PDF
- Cài `pdf-parse`
- Viết util parse PDF từ `File/Buffer`
- Hiển thị preview text 300 ký tự để debug

**Deliverable:** upload PDF -> parse ra text thành công.

## Block C (1:30–2:30) – Tích hợp AI
- Viết `prompt.ts` + rubric
- Gọi model + ép trả JSON
- Parse/validate bằng zod

**Deliverable:** API trả JSON phân tích chuẩn.

## Block D (2:30–3:30) – Render kết quả
- Score card + rubric breakdown
- Strengths/Weaknesses/Missing keywords
- Rewrite section + copy button

**Deliverable:** UX hoàn chỉnh đủ demo.

## Block E (3:30–4:15) – Xử lý lỗi & polish
- File validation
- Loading, empty state, error state
- Nội dung tiếng Việt/Anh thống nhất

**Deliverable:** app ổn định khi demo.

## Block F (4:15–5:00) – Demo prep
- Chuẩn bị 2 CV sample (1 yếu, 1 khá)
- Script demo 2 phút
- Chụp screenshot/GIF ngắn

**Deliverable:** sẵn sàng trình bày hackathon.

---

## 11) Checklist hoàn thành (Definition of Done)

- [ ] Upload PDF thành công
- [ ] Parse text từ PDF ổn định với file tiêu chuẩn
- [ ] Phân tích AI trả về trong < 15–20s
- [ ] Có score + rubric + suggestions
- [ ] Có missing keywords theo role
- [ ] Có xử lý lỗi user-friendly
- [ ] Demo end-to-end không crash

---

## 12) Rủi ro & phương án dự phòng

### Rủi ro 1: PDF parse lỗi
- **Fallback:** cho user paste CV text thủ công

### Rủi ro 2: LLM output không đúng JSON
- **Fallback:** retry 1 lần + strict prompt

### Rủi ro 3: API chậm
- **Fallback:** giới hạn output ngắn gọn, timeout 20s

### Rủi ro 4: Hết quota API
- **Fallback:** mock response JSON để vẫn demo UI

---

## 13) Phase 2 (nếu còn thời gian)

- Compare mode: CV cũ vs CV đã chỉnh
- Export markdown/pdf report
- Multi-language (VI/EN)
- Role templates (Backend, Frontend, Data, Product)
- History lưu local/database

---

## 14) Demo script gợi ý (90–120 giây)

1. “Đây là tool AI Roast My CV cho Intern/Fresher.”
2. Upload CV mẫu + nhập `Backend Intern`.
3. Chờ 5–10s -> hiện score + weaknesses.
4. Mở `Rewrite Experience` để thấy bản viết tốt hơn.
5. Chỉ vào `Missing Keywords`: “REST API, Docker, Unit Test”.
6. Kết: “Trong 1 lần phân tích, user biết cần sửa gì ngay để tăng cơ hội pass ATS.”

---

## 15) Ghi chú vận hành

- Tạo `.env.local`:
  - `OPENAI_API_KEY=...` hoặc key model bạn dùng
- Không log toàn bộ CV lên console production
- Có thể thêm disclaimer: “Kết quả chỉ mang tính tham khảo”

---

## 16) Kết luận

Đây là đề tài có **tỉ lệ hoàn thành cao trong 1 buổi chiều**, dễ demo, dễ mở rộng thành sản phẩm thật. Ưu tiên hoàn thành luồng MVP end-to-end trước, tránh thêm tính năng phụ quá sớm.
