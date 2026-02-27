# AI Image and Video Scene Creator

## Executive Summary
The **AI Video Scene Creator** is a high-performance, web-based platform designed to bridge the gap between advanced generative AI models and non-technical marketing practitioners. Built with React and TypeScript, the application orchestrates a sophisticated pipeline involving image generation, semantic annotation, and video synthesis. 

This report details the technical competencies demonstrated in its implementation, focusing on AI orchestration, security patterns, and operational efficiency.

![AI Image and Video Scene Creator](resources/ai-image-video.jpg)


## 1. AI/ML Engineering

The platform demonstrates advanced **Model Orchestration** and **Domain-Applied AI/ML** expertise, specifically addressing model constraints for enterprise use cases (e.g., Mars, Zillow).

- **Multi-Model Pipeline**: The application orchestrates a three-tier generative workflow:
    1.  **Image Generation**: Leverages `imagen-4.0-generate-001` for high-fidelity base asset creation.
    
    2.  **Prompt Enhancement**: Uses `gemini-2.5-flash` to perform **Automatic Prompt Augmentation**, transforming simple user inputs into descriptive prompts enriched with professional photography techniques (e.g., lens selection, lighting, angles).
    
    3.  **Video Synthesis**: Integrates `veo-3.1-generate-preview` and `veo-3.1-fast-generate-preview`, allowing users to choose between quality and latency.

- **Structured AI Orchestration**: Logic centralizing these calls is found in [`lib/api.ts`], which manages model selection trade-offs and error handling.

- **Evidence**: See the implementation of `handleGenerateImageWithOptions` at [`api.ts:L111-L150`].

## 2. Security, Privacy, and Compliance

A pragmatic approach to security ensures data privacy while maintaining low friction for external stakeholders.

- **Persistent Permission Patterns**: The application utilizes the **File System Access API** for local session storage. Since browser permissions for file handles do not persist across reloads, a custom `verifyPermission` mechanism was implemented to handle `NotAllowedError` and re-authorize access gracefully.

- **Stateless Authentication**: Leveraging API Keys via HTTP headers allows for frictionless integration with the Public Gemini API, avoiding the complexity of OAuth for single-tenant marketing tools while maintaining auditability.

- **Local-First Data Residency**: Sensitive session data, prompts, and uploaded images are saved directly to the user's local machine using `FileSystemDirectoryHandle`, ensuring that source material never persists on an intermediate server.

- **Evidence**: Permission verification logic at [`lib/session.ts:L24-L40`].

## 3. Reliability & Resilience

The implementation focuses on **Graceful Degradation** and **Observability** in a browser environment.

- **Storage Resilience**: The app uses `idb` (IndexedDB) to persist critical settings (API Keys, directory handles) across sessions, implemented in [`lib/settings.ts`].

- **Failure Recovery**: The API interaction layer includes structured logging for generation configurations, enabling rapid debugging of model-specific failures or 404/403 errors related to API endpoints.

- **UI Reactivity**: The application uses a key-based re-mounting strategy for session isolation, ensuring that switching between "Image Editing" and "Video Generation" preserves the component state correctly.

## 4. Performance & Cost Optimization

Optimization is achieved through strategic model selection and resource-efficient architecture.

- **Inference Optimization**: The integration of **Veo 3.1 Fast** enables a "Low Latency" mode for rapid prototyping, significantly reducing token consumption and wait times during the creative iteration phase.

- **Client-Side Processing**: By offloading image annotation and state management to the client (React/Vite), the server costs are minimized to static asset delivery via a lightweight Nginx container.

- **Token Efficiency**: Grounding video generation in pre-annotated images reduces the complexity required in the text prompt, leading to more predictable model outputs and fewer wasted generation cycles.

## 5. Operational Excellence

The project follows modern **CI/CD** and **Cloud Native** deployment principles.

- **Automated Pipeline**: A dual-stage CI/CD pipeline is implemented using **GitHub Actions** and **Google Cloud Build**:
    1.  **GitHub Actions**: Triggers on push to `main`, handling authentication via Service Account keys.
    2.  **Cloud Build**: Executes the container build and pushes the image to **Artifact Registry**.
    3.  **Cloud Run**: Automates the deployment of the containerized application.

- **Reproducible Environments**: The `Dockerfile` utilizes a multi-stage build (Node.js for compilation, Alpin-based Nginx for production) to ensure minimal image size and maximum portability.

- **Evidence**: Pipeline configurations in [`.github/workflows/deploy.yaml`]and [`cloudbuild.yaml`].

## 6. Designing for Change

The architecture prioritizes **Extensibility** and **Configuration Management**.

- **Externalized Knowledge Base**: Creative checklists and industry-specific guides are stored as Markdown, allowing content updates without code changes.

- **Model Agnostic Mapping**: Model identifiers are externalized in a mapping object within the components (e.g., [`VideoGenerator.tsx`]), enabling quick migration to newer model versions (e.g., moving from `v1beta` to `v1`).

## 7. System Architecture

```mermaid
graph TD
    subgraph Client ["Browser / Client-Side (React/Vite)"]
        UI["Web Interface (App.tsx)"]
        IE["Image Editor Component"]
        VG["Video Generator Component"]
        IDB[(IndexedDB: Settings/API Keys)]
        LFS[[Local File System: Session Data]]
        API_LIB["API Orchestration (lib/api.ts)"]
    end

    subgraph GCP_Cloud ["Google Cloud Platform"]
        subgraph Services ["Runtime Services"]
            CR["Cloud Run (Static Hosting/Nginx)"]
            AR["Artifact Registry (Docker Image)"]
        end
        subgraph AI_Models ["Generative AI Models (Public API)"]
            IM4["Imagen 4.0 (Image Gen)"]
            G25["Gemini 2.5 (Prompt/Describe)"]
            V31["Veo 3.1 (Video Synthesis)"]
        end
    end

    subgraph CI_CD ["CI/CD Pipeline"]
        GH["GitHub Repository"]
        GA["GitHub Actions"]
        CB["Cloud Build"]
    end

    UI --> IE
    UI --> VG
    IE -- "Prepared Image" --> VG
    IE --> API_LIB
    VG --> API_LIB
    API_LIB --> IM4
    API_LIB --> G25
    API_LIB --> V31
    UI <--> IDB
    API_LIB -.-> LFS

    GH -- "Push main" --> GA
    GA -- "Trigger" --> CB
    CB -- "Push Image" --> AR
    AR -- "Deploy" --> CR
```

## Conclusion

The **AI Video Scene Creator** represents a successful implementation of a cloud-native, AI-orchestrated platform. By prioritizing modularity and local-first data principles, the solution offers a secure and scalable environment for creative professionals. The integration of high-performance models like **Imagen 4.0** and **Veo 3.1** ensures that the platform remains at the cutting edge of generative AI, while the automated CI/CD pipeline guarantees operational excellence and rapid delivery of new features. 

This technical foundation positions the application as a robust baseline for future enhancements in domain-specific AI workflows.