"use client";

import { useState } from "react";
import { User, Lock, Bell, ShieldCheck, Save, Camera } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Manage account preferences and security options.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <aside className="surface-card p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mb-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition last:mb-0 ${
                activeTab === tab.id
                  ? "bg-[var(--action-600)] text-white"
                  : "text-[var(--text-body)] hover:bg-[var(--state-hover)]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="surface-card p-6 md:p-8">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 border-b border-[var(--border-subtle)] pb-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--text-muted)]">
            <User size={32} />
          </div>
          <button className="absolute -bottom-2 -right-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-[var(--action-600)] transition hover:bg-[var(--state-hover)]">
            <Camera size={16} />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-strong)]">Profile Picture</h3>
          <p className="text-xs text-[var(--text-muted)]">JPG, GIF or PNG. Max size 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">First Name</label>
          <input type="text" defaultValue="John" className="app-input" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Last Name</label>
          <input type="text" defaultValue="Doe" className="app-input" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Public Bio</label>
        <textarea rows={3} className="app-input resize-none" placeholder="Share a bit about yourself..." />
      </div>

      <button className="btn-primary gap-2">
        <Save size={16} /> Save Changes
      </button>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[color:var(--action-500)]/20 bg-[var(--action-100)] p-4 text-sm text-[var(--primary-700)]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[var(--action-600)]" size={18} />
          <p>Last password change was 3 months ago. We recommend updating it regularly.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Current Password</label>
          <input type="password" className="app-input" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">New Password</label>
          <input type="password" className="app-input" />
        </div>
      </div>

      <button className="btn-primary">Update Password</button>
    </div>
  );
}

function NotificationSettings() {
  const options = [
    { label: "New Sale Alerts", desc: "Get notified when someone buys your item." },
    { label: "Price Drops", desc: "Notify me when items in my wishlist get cheaper." },
    { label: "Marketing", desc: "Receive weekly newsletters and promo codes." },
  ];

  return (
    <div className="space-y-4">
      {options.map((opt, i) => (
        <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[var(--text-strong)]">{opt.label}</p>
              <p className="text-sm text-[var(--text-muted)]">{opt.desc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked={i < 2} />
              <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--action-600)] peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
