#!/usr/bin/env python3
"""
Reachy Mini Robot Hybrid Agent Integration Script for Dahamkke Classroom (다함께교실)

Architecture:
1. On-Device: Microphone Audio Capture & STT (Whisper / Gemma 3n)
2. Cloud Server: Calls Supabase Edge Functions (/interpret or /persona) for RAG & Multilingual AI responses
3. On-Device Output: Audio TTS Playback + Robot Head Nodding & Antenna Gestures
"""

import sys
import json
import time
import requests

# Supabase Edge Functions Endpoint Config
SUPABASE_FUNCTIONS_URL = "https://your-supabase-project.supabase.co/functions/v1"
SUPABASE_ANON_KEY = "your-supabase-anon-key"

def capture_speech_on_device():
    """Simulate on-device STT audio recording and text recognition."""
    print("🤖 [Reachy Mini] Listening for speech (Korean/Russian/Chinese/Vietnamese)...")
    time.sleep(1.0)
    # Simulated recognized speech
    return {
        "text": "안녕하세요 리치! 흥부전에 대해 이야기해줄래?",
        "fromLang": "ko",
        "toLang": "ru"
    }

def call_edge_function(function_name, payload):
    """Call Supabase Edge Function without exposing API keys on the robot."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    url = f"{SUPABASE_FUNCTIONS_URL}/{function_name}"
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        print(f"⚠️ [Reachy Mini] Edge Function Call Failed ({function_name}): {e}")
        # Fallback local response
        return {
            "answer": "안녕! 나는 교과서 속 인물이란다. 무더운 날에도 열공하고 있구나!",
            "sources": ["국어 5-1 나 2단원 1문단"]
        }

def move_robot_head_and_speak(text, sources=None):
    """Output TTS audio and perform physical robot nodding motion."""
    print(f"🤖 [Reachy Mini Movement] Nodding head & animating antennas...")
    if sources:
        print(f"🏷️ [RAG Source Tag] {', '.join(sources)}")
    print(f"🔊 [Reachy Mini Speaker TTS Output]: {text}")

def main():
    print("=" * 60)
    print("🤖 Reachy Mini Hybrid Agent Initialized (다함께교실 온디바이스 에이전트)")
    print("=" * 60)

    # 1. Listen to student speech
    speech_data = capture_speech_on_device()
    print(f"🎙️ [STT Recognized]: {speech_data['text']}")

    # 2. Query Persona / Interpret Edge Function
    payload = {
        "personaId": "흥부",
        "question": speech_data['text'],
        "userLang": speech_data['toLang']
    }
    result = call_edge_function("persona", payload)

    # 3. Express answer physically via robot
    answer_text = result.get("answer", "반갑습니다!")
    sources = result.get("sources", [])
    move_robot_head_and_speak(answer_text, sources)

if __name__ == "__main__":
    main()
