import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Download,
  FileImage,
  Layers3,
  Menu,
  Satellite,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  X,
  Zap
} from "lucide-react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function LogoMark({ small = false }) {
  return (
    <div className={`logo-mark ${small ? "small" : ""}`} aria-hidden="true">
      <span className="logo-orbit orbit-a" />
      <span className="logo-orbit orbit-b" />
      <span className="logo-earth">
        <span className="earth-grid earth-lat one" />
        <span className="earth-grid earth-lat two" />
        <span className="earth-grid earth-long one" />
        <span className="earth-grid earth-long two" />
        <span className="earth-land land-a" />
        <span className="earth-land land-b" />
      </span>
      <span className="logo-satellite-dot" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function PageTransition() {
  const location = useLocation();

  return (
    <main className="page-shell">
      <div key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </main>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/demo", label: "Demo" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/applications", label: "Applications" }
  ];

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <LogoMark small />
          <span>
            <strong style={{ fontSize: "1.2rem", fontWeight: 700 }}>SatSR</strong>
          </span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/demo" className="nav-cta" onClick={() => setOpen(false)}>
            Try Demo <ArrowRight size={16} />
          </Link>
        </nav>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function SectionHeading({ eyebrow, title, text, centered = false }) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function SatelliteVisual({ large = false }) {
  return (
    <div className={`satellite-visual ${large ? "large" : ""}`}>
      <div className="visual-glow" />
      <div className="orbit orbit-1" />
      <div className="orbit orbit-2" />
      <div className="orbit orbit-3" />
      <div className="earth-3d">
        <div className="earth-surface">
          <span className="continent c1" />
          <span className="continent c2" />
          <span className="continent c3" />
          <span className="continent c4" />
          <span className="latitude l1" />
          <span className="latitude l2" />
          <span className="longitude g1" />
          <span className="longitude g2" />
        </div>
        <div className="earth-shine" />
        <div className="earth-shadow" />
      </div>
      <div className="satellite-node node-1"><CircleDot size={12} /></div>
      <div className="satellite-node node-2"><CircleDot size={9} /></div>
      <div className="coordinate-tag tag-1">28.6139° N</div>
      <div className="coordinate-tag tag-2">77.2090° E</div>
      <div className="visual-caption">
        <span className="live-dot" /> GEOSPATIAL CORE
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>
              See more detail
              <span>from every pixel.</span>
            </h1>
            <p className="hero-lead">
              SatSR is a proposed deep-learning satellite super-resolution system
              designed to transform medium-resolution imagery into sharper,
              analysis-ready detail while preserving spatial and spectral consistency.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate("/demo")}>
                Explore Demo <ArrowRight size={18} />
              </button>
              <button className="secondary-btn" onClick={() => navigate("/how-it-works")}>
                How It Works <ChevronRight size={18} />
              </button>
            </div>
            <div className="hero-metrics">
              <div><strong>4×</strong><span>Target upscale</span></div>
              <div><strong>10 → 2.5m</strong><span>Target pixel scale</span></div>
              <div><strong>+ U</strong><span>Uncertainty map</span></div>
            </div>
          </div>
          <SatelliteVisual large />
        </div>
      </section>

      <section className="section problem-section">
        <div className="container">
          <SectionHeading
            eyebrow="THE CHALLENGE"
            title="Medium resolution can hide the details that matter."
            text="Satellite imagery is powerful at scale, but many real-world decisions depend on fine spatial structures that disappear at 10–30m resolution."
          />
          <div className="problem-grid">
            {[
              ["Small structures", "Buildings and localized construction can occupy only a few pixels.", "01"],
              ["Narrow networks", "Roads, paths and linear features become difficult to separate.", "02"],
              ["Field boundaries", "Fine agricultural boundaries can blur into neighbouring regions.", "03"],
              ["Disaster detail", "Localized damage patterns may be missed when affected areas are small.", "04"]
            ].map(([title, text, no]) => (
              <article className="problem-card" key={title}>
                <span>{no}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section vision-section">
        <div className="container split-section">
          <div>
            <span className="eyebrow">OUR VISION</span>
            <h2>Reconstruct useful detail without losing the character of the source image.</h2>
            <p>
              The proposed system uses a hybrid CNN + Transformer architecture to
              learn local spatial features and wider contextual relationships.
              The objective is not simply to make an image look sharper, but to
              reconstruct fine-scale information while respecting the source imagery.
            </p>
            <Link to="/how-it-works" className="text-link">
              Explore the proposed pipeline <ArrowRight size={16} />
            </Link>
          </div>
          <div className="vision-card">
            <div className="vision-card-top">
              <span>PROPOSED OUTPUT</span>
              <span className="verified"><ShieldCheck size={15} /> CONSISTENCY-AWARE</span>
            </div>
            <div className="resolution-visual">
              <div className="resolution-block low">
                <div className="pixel-map">
                  {Array.from({ length: 36 }).map((_, i) => <i key={i} />)}
                </div>
                <span>10m INPUT</span>
              </div>
              <ArrowRight className="resolution-arrow" />
              <div className="resolution-block high">
                <div className="pixel-map">
                  {Array.from({ length: 100 }).map((_, i) => <i key={i} />)}
                </div>
                <span>2.5m TARGET</span>
              </div>
            </div>
            <div className="vision-card-footer">
              <span>Spatial detail</span><b>4×</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section capabilities-section">
        <div className="container">
          <SectionHeading
            eyebrow="SYSTEM CAPABILITIES"
            title="Designed around more than visual sharpness."
            centered
          />
          <div className="capability-grid">
            {[
              [Layers3, "4× Super-Resolution", "Generate a higher-resolution representation from medium-resolution satellite input."],
              [Sparkles, "Hybrid CNN + Transformer", "Combine local feature extraction with broader spatial context."],
              [Target, "Consistency Aware", "Preserve important spatial and spectral characteristics of the source."],
              [ScanSearch, "Uncertainty Mapping", "Show where reconstructed details have higher or lower confidence."]
            ].map(([Icon, title, text]) => (
              <article className="capability-card" key={title}>
                <div className="icon-box"><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="card-arrow"><ArrowRight size={16} /></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-card">
          <div>
            <span className="eyebrow">PROTOTYPE EXPERIENCE</span>
            <h2>See the intended workflow in action.</h2>
            <p>Upload a satellite image and explore the proposed enhancement workflow through our interactive prototype.</p>
          </div>
          <Link to="/demo" className="primary-btn">
            Launch Demo <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Demo() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const stages = [
    "Satellite imagery received",
    "Validating image dimensions",
    "Preparing spatial data",
    "Enhancing spatial details",
    "Generating enhanced output",
    "Finalizing result"
  ];

  function chooseFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setResult(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setProgress(0);
    setStage(0);
  }

  async function enhance() {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    setProgress(4);
    setStage(0);

    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      const p = Math.min(96, 4 + (elapsed / 6500) * 92);
      setProgress(p);
      setStage(Math.min(stages.length - 1, Math.floor((p / 100) * stages.length)));
    }, 120);

    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch(`${API_BASE}/api/enhance`, {
        method: "POST",
        body: form
      });

      if (!response.ok) throw new Error("Enhancement service returned an error.");
      const data = await response.json();
      clearInterval(timer);
      setProgress(100);
      setStage(stages.length - 1);
      setTimeout(() => {
        setResult({
          ...data,
          enhancedImageUrl: data.enhancedImageUrl?.startsWith("http")
            ? data.enhancedImageUrl
            : `${API_BASE}${data.enhancedImageUrl}`
        });
        setProcessing(false);
      }, 450);
    } catch (err) {
      clearInterval(timer);
      setProcessing(false);
      setError(
        "Could not connect to the backend. Start the Node server on port 5000 and try again."
      );
    }
  }

  function reset() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setProgress(0);
    setStage(0);
  }

  return (
    <section className="demo-page section">
      <div className="container">
        <div className="page-intro">
          <div>
            <span className="eyebrow">INTERACTIVE PROTOTYPE</span>
            <h1>Satellite Enhancement Demo</h1>
            <p>
              Explore the intended workflow from medium-resolution satellite input
              to a higher-resolution output.
            </p>
          </div>
          <div className="prototype-badge"><CircleDot size={13} /> Prototype Demonstration</div>
        </div>

        {!result ? (
          <div className="demo-layout">
            <div className="upload-panel panel">
              <div
                className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  chooseFile(e.dataTransfer.files?.[0]);
                }}
              >
                {file ? (
                  <>
                    <div className="file-icon"><FileImage size={27} /></div>
                    <h3>{file.name}</h3>
                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}</p>
                    <button className="secondary-btn small-btn" onClick={reset}>Choose another</button>
                  </>
                ) : (
                  <>
                    <div className="upload-icon"><Upload size={28} /></div>
                    <h3>Drop satellite imagery here</h3>
                    <p>PNG, JPG or other browser-supported image formats</p>
                    <label className="primary-btn file-btn">
                      Select Image
                      <input type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files?.[0])} />
                    </label>
                  </>
                )}
              </div>

              {file && preview && (
                <div className="input-preview">
                  <div className="preview-label"><span>INPUT PREVIEW</span><span>10m / pixel</span></div>
                  <img src={preview} alt="Selected satellite input" />
                </div>
              )}

              {error && <div className="error-box">{error}</div>}

              <button className="primary-btn full-btn" disabled={!file || processing} onClick={enhance}>
                {processing ? <><Zap size={17} /> Processing...</> : <><Sparkles size={17} /> Enhance Image</>}
              </button>
            </div>

            <div className="demo-info">
              <div className="panel info-panel">
                <span className="eyebrow">WHAT THIS PROTOTYPE SHOWS</span>
                <h2>From input imagery to enhanced detail.</h2>
                <p>
                  The interface demonstrates the intended product experience.
                  The final project will integrate the trust layer and uncertainty mapping.
                </p>
                <div className="workflow-list">
                  {stages.map((item, i) => (
                    <div className="workflow-item" key={item}>
                      <span className={`workflow-number ${processing && i <= stage ? "active" : ""}`}>
                        {processing && i < stage ? <Check size={13} /> : i + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {processing && (
                <div className="panel processing-panel">
                  <div className="processing-top">
                    <span>PROCESSING PIPELINE</span>
                    <strong>{Math.round(progress)}%</strong>
                  </div>
                  <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
                  <p>{stages[stage]}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ResultView result={result} original={preview} onReset={reset} />
        )}
      </div>
    </section>
  );
}

function CompareSlider({ original, enhanced }) {
  const [pos, setPos] = useState(50);
  const stageRef = useRef(null);
  const dragging = useRef(false);

  function updateFromX(clientX) {
    const rect = stageRef.current.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  }

  function onPointerDown(e) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromX(e.clientX);
  }

  function onPointerMove(e) {
    if (dragging.current) updateFromX(e.clientX);
  }

  function onPointerUp(e) {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function onKeyDown(e) {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 3));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 3));
  }

  return (
    <div
      className="compare-slider"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Base layer: enhanced (visible on the right of the handle) */}
      <img className="compare-img" src={enhanced} alt="Enhanced satellite output" draggable="false" />

      {/* Top layer: original, clipped to the left of the handle */}
      <img
        className="compare-img"
        src={original}
        alt="Original satellite input"
        draggable="false"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="compare-label left" style={{ opacity: pos > 12 ? 1 : 0 }}>ORIGINAL</span>
      <span className="compare-label right" style={{ opacity: pos < 88 ? 1 : 0 }}>ENHANCED</span>

      <div
        className="compare-handle"
        style={{ left: `${pos}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Compare original and enhanced"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
      >
        <span className="compare-grip">
          <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

function ResultView({ result, original, onReset }) {
  return (
    <div className="result-page">
      <div className="result-header">
        <div>
          <span className="eyebrow">ENHANCEMENT COMPLETE</span>
          <h2>Higher-resolution output</h2>
          <p>Drag the slider to compare the source image with the prepared enhanced prototype output.</p>
        </div>
        <button className="secondary-btn" onClick={onReset}>New Image</button>
      </div>

      <div className="comparison panel">
        <CompareSlider original={original} enhanced={result.enhancedImageUrl} />
      </div>

      <div className="result-grid">
        <div className="panel result-specs">
          <span className="eyebrow">OUTPUT SUMMARY</span>
          <div className="spec-row"><span>Source resolution</span><b>{result.sourceResolution || "10 m/pixel"}</b></div>
          <div className="spec-row"><span>Target resolution</span><b>{result.targetResolution || "2.5 m/pixel (target)"}</b></div>
          <div className="spec-row"><span>Scale factor</span><b>4× target</b></div>
          <div className="spec-row"><span>Mode</span><b>Prototype</b></div>
          <a className="secondary-btn download-btn" href={result.enhancedImageUrl} download>
            <Download size={17} /> Download Output
          </a>
        </div>

        <div className="panel future-panel">
          <div className="future-icon"><ShieldCheck size={22} /></div>
          <span className="eyebrow">PLANNED VALIDATION LAYER</span>
          <h3>Confidence-aware output</h3>
          <p>
            The proposed final system will pair the enhanced imagery with an
            uncertainty map to communicate where reconstructed details are more or less certain.
          </p>
          <div className="future-points">
            <span>Spatial consistency</span>
            <span>Spectral consistency</span>
            <span>Uncertainty mapping</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Satellite Image Input",
      text: "Medium-resolution satellite imagery, such as Sentinel-2 data, enters the system as the source representation.",
      icon: Satellite
    },
    {
      n: "02",
      title: "Spatial & Spectral Preparation",
      text: "The imagery is prepared for inference while retaining the information needed to preserve geographic and spectral characteristics.",
      icon: Layers3
    },
    {
      n: "03",
      title: "Hybrid CNN + Transformer",
      text: "CNN components learn local textures, edges and spatial features, while Transformer components model wider contextual relationships.",
      icon: Sparkles
    },
    {
      n: "04",
      title: "4× Super-Resolution",
      text: "The model reconstructs a higher-resolution representation with a target scale of 10m to 2.5m per pixel.",
      icon: Zap
    },
    {
      n: "05",
      title: "Consistency & Uncertainty",
      text: "The proposed output includes consistency-aware reconstruction and an uncertainty map indicating where inferred details have different confidence levels.",
      icon: ShieldCheck
    }
  ];

  return (
    <section className="section inner-page">
      <div className="container">
        <div className="page-intro centered">
          <span className="eyebrow">PROPOSED SYSTEM</span>
          <h1>How SatSR works</h1>
          <p>
            The following describes the intended final project architecture and
            processing pipeline, rather than the current prototype implementation.
          </p>
        </div>

        <div className="pipeline">
          {steps.map(({ n, title, text, icon: Icon }, i) => (
            <React.Fragment key={n}>
              <article className="pipeline-step">
                <div className="step-number">{n}</div>
                <div className="step-icon"><Icon size={23} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
              {i < steps.length - 1 && <div className="pipeline-line"><ArrowRight size={16} /></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="architecture panel">
          <div className="architecture-copy">
            <span className="eyebrow">MODEL CONCEPT</span>
            <h2>Local detail + global context.</h2>
            <p>
              The hybrid architecture is intended to combine complementary strengths:
              convolutional feature extraction for local spatial patterns and
              Transformer-based attention for relationships across a wider image region.
            </p>
          </div>
          <div className="architecture-diagram">
            <div className="arch-box source"><Satellite size={18} /> Medium Resolution</div>
            <div className="arch-split">
              <div className="arch-box"><Layers3 size={18} /> CNN Features</div>
              <div className="arch-box"><Sparkles size={18} /> Transformer Context</div>
            </div>
            <div className="arch-merge"><ArrowRight size={18} /></div>
            <div className="arch-box output"><Target size={18} /> 4× Enhanced Output</div>
          </div>
        </div>

        <div className="uncertainty-section">
          <SectionHeading
            eyebrow="WHY CONFIDENCE MATTERS"
            title="Not every reconstructed detail carries the same certainty."
            text="The proposed uncertainty layer is designed to make model-inferred information more transparent to downstream users."
          />
          <div className="uncertainty-grid">
            <div className="uncertainty-card high"><span>HIGHER CONFIDENCE</span><p>Details supported strongly by learned spatial patterns and source evidence.</p></div>
            <div className="uncertainty-card medium"><span>INTERMEDIATE</span><p>Areas where reconstruction benefits from contextual inference.</p></div>
            <div className="uncertainty-card low"><span>HIGHER UNCERTAINTY</span><p>Regions where the model has less reliable evidence for fine detail.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Applications() {
  const apps = [
    {
      icon: "01",
      title: "Urban Mapping",
      text: "Support finer-scale observation of built-up regions, structures and road networks.",
      tags: ["Buildings", "Roads", "Urban growth"]
    },
    {
      icon: "02",
      title: "Agriculture",
      text: "Improve visibility of field boundaries and localized patterns for agricultural monitoring.",
      tags: ["Fields", "Boundaries", "Crop monitoring"]
    },
    {
      icon: "03",
      title: "Disaster Assessment",
      text: "Help reveal localized damage patterns and affected structures after major events.",
      tags: ["Damage", "Affected areas", "Response"]
    },
    {
      icon: "04",
      title: "Land Monitoring",
      text: "Provide finer spatial detail for land-use and land-cover observation over large areas.",
      tags: ["Land cover", "Change", "Monitoring"]
    }
  ];

  return (
    <section className="section inner-page">
      <div className="container">
        <div className="page-intro">
          <div>
            <span className="eyebrow">APPLICATION AREAS</span>
            <h1>Where finer satellite detail can help.</h1>
            <p>
              The proposed system is designed as a general-purpose super-resolution
              layer that can support multiple geospatial analysis workflows.
            </p>
          </div>
          <SatelliteVisual />
        </div>

        <div className="applications-grid">
          {apps.map((app) => (
            <article className="application-card" key={app.title}>
              <div className="application-top">
                <span className="app-number">{app.icon}</span>
                <ArrowRight size={20} />
              </div>
              <h2>{app.title}</h2>
              <p>{app.text}</p>
              <div className="tag-row">
                {app.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className="application-note panel">
          <div className="icon-box"><ScanSearch size={21} /></div>
          <div>
            <span className="eyebrow">DESIGNED FOR SCALE</span>
            <h3>One enhancement layer, multiple downstream uses.</h3>
            <p>
              The intended architecture can sit before downstream geospatial
              analytics, helping applications work with a more detailed representation
              while retaining awareness of uncertainty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="brand">
          <LogoMark small />
          <span><strong>SatSR</strong></span>
        </div>
        <span>Prototype • Space Technology</span>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <PageTransition />
      <Footer />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
