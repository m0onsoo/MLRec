
# MLRec: AI-Powered Movie Recommendation System

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0-EE4C2C)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)
![AWS](https://img.shields.io/badge/Deployment-AWS_EC2-FF9900)

MLRec is a modern movie recommendation web application that delivers personalized suggestions using advanced machine learning. It features a sleek, Netflix-inspired UI and a high-performance backend powered by LightGCN.

---

## 🚀 Key Features

-   **Personalized Recommendations**: Uses **LightGCN** (Graph Convolutional Network) trained on user interaction graphs.
-   **Real-time Inference**: Lightweight PyTorch-based inference engine served via FastAPI.
-   **Interactive UI**: "Premium" aesthetic using **Next.js 15**, **Tailwind CSS**, and **Framer Motion**.
-   **Smart Search**: Instant movie search with autocomplete and poster previews via **TMDB API**.
-   **Containerized Architecture**: Fully Dockerized (Frontend + Backend) for easy deployment.
-   **Cloud Ready**: Optimized for AWS EC2 deployment with `linux/amd64` support.

---

## 🛠️ Tech Stack

### AI & Backend
-   **Framework**: [RecBole](https://recbole.io/) (Model Training), [FastAPI](https://fastapi.tiangolo.com/) (Inference API).
-   **Model**: LightGCN.
-   **Data Processing**: Pandas, NumPy, PyTorch.
-   **Dependency Management**: Decoupled architecture (Training vs Inference).

### Frontend
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
-   **Language**: TypeScript.
-   **Styling**: Tailwind CSS, Lucide Icons.
-   **Animations**: Framer Motion.

### DevOps
-   **Containerization**: Docker, Docker Compose.
-   **Infrastructure**: AWS EC2 (Ubuntu 24.04 LTS).

---

## 📊 Dataset & Model

This project uses a **sampled version of the MovieLens Latest Dataset** to optimize for training efficiency while maintaining recommendation quality.

-   **Source**: [MovieLens Latest Datasets](https://grouplens.org/datasets/movielens/latest/)
-   **Preprocessing**:
    -   Data sampled to balance sparsity and coverage.
    -   Mapped to **TMDB IDs** (`links-preprocessed.csv`) to fetch high-quality movie posters.
-   **Training**:
    -   Framework: **RecBole**.
    -   Algorithm: **LightGCN**.
    -   The trained model weights (`.pth`) are exported to lightweight artifacts (`item_embeddings.pt`, `item_map.json`) for efficient production inference.

---

## 🏃‍♂️ Getting Started

### Prerequisites
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
-   [TMDB API Key](https://www.themoviedb.org/documentation/api) (Free).

### 1. Quick Start (Docker Compose)
The easiest way to run the app is using Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/moonsoopark/MLRec.git
    cd MLRec
    ```

2.  **Configure Environment**:
    Create a `.env.local` file in the `frontend` directory:
    ```bash
    echo "TMDB_API_KEY=your_tmdb_api_key_here" > frontend/.env.local
    ```

3.  **Run with Docker**:
    ```bash
    docker-compose up -d
    ```
    -   **Frontend**: `http://localhost:3000`
    -   **Backend**: `http://localhost:8000/docs` (Swagger UI)

### 2. Manual Installation (Dev Mode)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Run Server
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment (AWS EC2)

This project is effectively deployed on AWS EC2.

1.  **Launch Instance**: Ubuntu 24.04 LTS, `t3.medium`.
2.  **Security Group**: Open ports `22` (SSH), `3000` (Web), `8000` (API).
3.  **Deploy**:
    ```bash
    # On Server
    mkdir mlrec && cd mlrec
    nano docker-compose.yml  # Paste content from repo
    nano .env.local          # Paste TMDB Key
    docker compose up -d
    ```
    *Images are pulled directly from Docker Hub (`moonsoopark/mlrec-backend`, `moonsoopark/mlrec-frontend`).*

---

## 📂 Project Structure

```
MLRec/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # API Entrypoint
│   │   ├── model_service.py # Inference Logic
│   │   └── data/           # Decoupled Model Artifacts
│   └── Dockerfile          # Backend Image (Python 3.10)
├── frontend/               # Next.js Frontend
│   ├── src/                # React Components & Pages
│   └── Dockerfile          # Frontend Image (Node 20)
├── RecBole/                # (Optional) Training Framework
└── docker-compose.yml      # Orchestration
```


