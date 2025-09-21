# 📂 legal/ Folder  

The `legal/` folder contains **Markdown (`.md`) files** representing the case histories of multiple users.  
These files act as the **knowledge base** for our **Retrieval-Augmented Generation (RAG) pipeline**.  

---

## 🎯 Purpose  

- Acts as the **primary data source** for the AI.  
- Each `.md` file contains the **details of a single user’s legal case**.  
- Text from these files is **converted into vector embeddings** and stored in the `faiss_index/` folder.  
- These embeddings allow the AI to:  
  - Understand user challenges.  
  - Retrieve similar past cases.  
  - Suggest positive outcomes if available.  

---


- Currently contains **20+ case files**.  
- Each file follows a Markdown format for consistency.  

---

## 🧩 File Content Format  

Each `.md` file typically includes:  
- **Case Title / Summary** → Short description of the issue.  
- **Case Details** → Step-by-step explanation of what happened.  
- **Verdict** → Positive / Negative outcome.  
- **Reasoning** → Why the decision was made.  

This consistent structure ensures smooth ingestion into the RAG pipeline.  

---

## 🔄 Workflow Integration  

1. **Data Source** → These `.md` files are the starting point.  
2. **Vectorization** → Files are converted into embeddings via RAG code in `demo.ipynb`.  
3. **Indexing** → Embeddings stored in `faiss_index/`.  
4. **Retrieval** → During a user query, FAISS retrieves the most relevant cases.  
5. **AI Reasoning** → If positive examples exist, the AI highlights *why* they succeeded.  


## ✅ Summary  

The `legal/` folder is:  
- The **core knowledge base** of the project.  
- Provides **20+ user case files** in `.md` format.  
- Directly powers the **RAG + FAISS pipeline**.  
- Ensures **privacy-first integration** with anonymization.  
