import type { ExtractedProfile } from '../../lib/schemas';

interface Props {
  profile: ExtractedProfile;
}

export default function ProfileSection({ profile }: Props) {
  return (
    <div className="space-y-6">
      {/* Skills */}
      {profile.skills.length > 0 && (
        <section aria-label="Skills">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {profile.experience.length > 0 && (
        <section aria-label="Experience">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Experience</h3>
          <ul className="space-y-3">
            {profile.experience.map((exp, i) => (
              <li key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{exp.title}</p>
                    <p className="text-xs text-slate-500">{exp.employer}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{exp.years}y</span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-xs text-slate-600">{exp.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <section aria-label="Education">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Education</h3>
          <ul className="space-y-2">
            {profile.education.map((edu, i) => (
              <li key={i} className="text-sm text-slate-700">
                <span className="font-medium">{edu.degree}</span>
                {edu.field && <span className="text-slate-500"> in {edu.field}</span>}
                {edu.institution && <span className="text-slate-400"> — {edu.institution}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Projects */}
      {profile.projects.length > 0 && (
        <section aria-label="Projects">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Projects</h3>
          <ul className="space-y-3">
            {profile.projects.map((proj, i) => (
              <li key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{proj.name}</p>
                {proj.technologies.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {proj.technologies.map(tech => (
                      <span key={tech} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {proj.description && (
                  <p className="mt-2 text-xs text-slate-600">{proj.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
