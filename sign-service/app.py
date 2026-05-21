"""
Sign Language Microservice — v2
--------------------------------
Correct API for spoken-to-signed 0.0.2:
  text_to_gloss.simple.text_to_gloss(text, language) -> List[Gloss]
  gloss_to_pose.gloss_to_pose(glosses, spoken_language, signed_language) -> Pose

Runs on http://localhost:5050
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
import math

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# ── Lazy-load heavy pipeline once ────────────────────────────────────────────

_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    try:
        from spoken_to_signed.text_to_gloss.simple import text_to_gloss
        from spoken_to_signed.gloss_to_pose import gloss_to_pose
        _pipeline = {
            "text_to_gloss": text_to_gloss,
            "gloss_to_pose": gloss_to_pose,
        }
        print("[sign-service] ✓ Pipeline loaded successfully")
    except Exception as e:
        print(f"[sign-service] ✗ Pipeline load error: {e}")
        traceback.print_exc()
        _pipeline = None

    return _pipeline


# ── Pose → JSON frames ────────────────────────────────────────────────────────

def pose_to_frames(pose_obj):
    """Convert pose-format Pose to list of {timestamp, keypoints} dicts."""
    frames = []
    try:
        import numpy as np
        data = pose_obj.body.data          # shape: (frames, people, kps, dims)
        fps  = float(getattr(pose_obj.body, "fps", 25))

        if hasattr(data, "filled"):
            data = data.filled(0.0)

        n_frames = data.shape[0]
        for i in range(n_frames):
            kps = data[i, 0]               # (kps, dims)
            frames.append({
                "timestamp": round(i / fps, 4),
                "keypoints": kps.tolist(),
            })
    except Exception as e:
        print(f"[sign-service] pose_to_frames error: {e}")
    return frames


# ── Demo poses (fallback when pipeline fails) ─────────────────────────────────

def demo_poses(words):
    """Simple oscillating skeleton — 1 second per word, 25 fps."""
    fps    = 25
    frames = []
    for w_idx, word in enumerate(words):
        for f in range(fps):
            angle = (f / fps) * math.pi * 2
            kps   = []
            for k in range(17):
                x = 0.5 + 0.15 * math.cos(angle + k * 0.4)
                y = 0.4 + 0.15 * math.sin(angle + k * 0.4)
                kps.append([x, y, 0.0])
            frames.append({
                "timestamp": round(w_idx + f / fps, 4),
                "keypoints": kps,
                "word": word,
            })
    return frames


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    pipeline = get_pipeline()
    return jsonify({
        "status": "ok",
        "pipeline": "loaded" if pipeline else "fallback (demo poses)",
    })


@app.route("/translate", methods=["POST"])
def translate():
    body     = request.get_json(silent=True) or {}
    text     = str(body.get("text", "")).strip()
    language = str(body.get("language", "en")).strip()

    if not text:
        return jsonify({"error": "text is required"}), 400

    pipeline = get_pipeline()

    # ── Fallback: no pipeline ──────────────────────────────────────────────
    if pipeline is None:
        words = text.upper().split()
        return jsonify({
            "poses":        demo_poses(words),
            "glosses":      words,
            "fps":          25,
            "total_frames": len(words) * 25,
            "warning":      "Pipeline unavailable — demo poses returned",
        })

    # ── Real pipeline ──────────────────────────────────────────────────────
    try:
        text_to_gloss = pipeline["text_to_gloss"]
        gloss_to_pose = pipeline["gloss_to_pose"]

        # Step 1: text → Gloss list
        # text_to_gloss(text, language) returns List[Gloss]
        gloss_objects = text_to_gloss(text, language)
        # Each Gloss has a .gloss attribute (the sign word)
        gloss_list = [g.gloss if hasattr(g, "gloss") else str(g) for g in gloss_objects]

        print(f"[sign-service] Glosses: {gloss_list}")

        # Step 2: gloss list → Pose
        # gloss_to_pose(glosses, spoken_language, signed_language)
        # signed_language for ASL = "ase"
        pose = gloss_to_pose(gloss_list, spoken_language=language, signed_language="ase")

        # Step 3: serialize
        frames = pose_to_frames(pose)
        fps    = float(getattr(pose.body, "fps", 25))

        return jsonify({
            "poses":        frames,
            "glosses":      gloss_list,
            "fps":          fps,
            "total_frames": len(frames),
        })

    except Exception as e:
        traceback.print_exc()
        words = text.upper().split()
        return jsonify({
            "poses":        demo_poses(words),
            "glosses":      words,
            "fps":          25,
            "total_frames": len(words) * 25,
            "error":        str(e),
            "warning":      "Pipeline error — demo poses returned",
        })


# ── Entry ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("[sign-service] Starting on http://localhost:5050")
    get_pipeline()   # warm up on start
    app.run(host="0.0.0.0", port=5050, debug=False)
