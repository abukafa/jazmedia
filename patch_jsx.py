import sys
import re

with open('src/app/profile/edit/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

banner_jsx = '''
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Banner / Header
          </label>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            {bannerImage && (
              <img src={getDirectMediaUrl(bannerImage)} alt="Banner" className="w-24 h-12 object-cover rounded-md" />
            )}
            <label className="cursor-pointer inline-flex items-center justify-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Banner"}
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={isUploadingBanner || isSaving} />
            </label>
          </div>
        </div>
'''

headline_jsx = '''
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Headline (Peran & Spesialisasi)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            disabled={isSaving}
            placeholder="Contoh: Frontend Developer | UI/UX Enthusiast"
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          />
        </div>
'''

address_jsx = '''
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Lokasi / Alamat
          </label>
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            disabled={isSaving}
            placeholder="Contoh: Jakarta, Indonesia"
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          />
        </div>
'''

education_jsx = '''
        <div>
          <div className="flex justify-between items-center mb-2 px-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Riwayat Pendidikan
            </label>
            <button
              onClick={handleAddEducation}
              disabled={isSaving}
              className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative group">
                <button
                  onClick={() => handleRemoveEducation(idx)}
                  disabled={isSaving}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                    placeholder="Nama Sekolah / Universitas"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => handleUpdateEducation(idx, "major", e.target.value)}
                    placeholder="Jurusan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                    placeholder="Gelar (Opsional)"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleUpdateEducation(idx, "year", e.target.value)}
                    placeholder="Tahun Lulus"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
            {education.length === 0 && (
              <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
                <p className="text-sm font-medium text-slate-500 mb-2">Belum ada data pendidikan</p>
                <button onClick={handleAddEducation} className="text-blue-600 text-sm font-bold hover:underline">
                  Tambah Pendidikan
                </button>
              </div>
            )}
          </div>
        </div>
'''

code = code.replace(
    '''        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Foto Profil
          </label>''',
    banner_jsx + '''\n        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">
            Foto Profil
          </label>'''
)

# Replace the input block for username to append headline and address
parts = code.split('<div>\n          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">\n            Instagram\n          </label>')
if len(parts) > 1:
    parts[0] = parts[0] + headline_jsx + '\n' + address_jsx + '\n'
    code = '<div>\n          <label className="block text-xs font-bold text-slate-700 mb-2 px-2 uppercase tracking-wide">\n            Instagram\n          </label>'.join(parts)

# Replace Bio block to append education
parts2 = code.split('<div>\n          <div className="flex justify-between items-center mb-2 px-2">\n            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">\n              Skills\n            </label>')
if len(parts2) > 1:
    parts2[0] = parts2[0] + education_jsx + '\n'
    code = '<div>\n          <div className="flex justify-between items-center mb-2 px-2">\n            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">\n              Skills\n            </label>'.join(parts2)


with open('src/app/profile/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('JSX Patched!')
