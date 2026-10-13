import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSkillManifest } from '../lib/manifest';
import { listSkills } from '../lib/catalog';

test('skill manifests require actual frontmatter metadata, not a filename alone', () => {
  assert.equal(parseSkillManifest('# Just a README'), null);
  assert.equal(parseSkillManifest('---\nname: demo\ndescription:\nlicense: MIT\n---\n'), null);
  assert.equal(parseSkillManifest('---\nname: tool\n---\n# Tool'), null);
  assert.deepEqual(parseSkillManifest('---\nname: dcf-model\ndescription: >-\n  Build a valuation model\n  using documented assumptions.\n---\n# DCF'), { name: 'dcf-model', description: 'Build a valuation model using documented assumptions.' });
});

test('multiple skills in one repository keep separate stable identities', () => {
  const rows = listSkills([{ full_name: 'owner/tools', owner: 'owner', has_skill_md: true, skills: [
    { name: 'risk', path: 'skills/risk/SKILL.md', source_url: 'https://github.com/owner/tools/blob/main/skills/risk/SKILL.md', description: 'Risk research' },
    { name: 'portfolio', path: 'skills/portfolio/SKILL.md', source_url: 'https://github.com/owner/tools/blob/main/skills/portfolio/SKILL.md', description: 'Portfolio research' },
  ] }]);
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].id, rows[1].id);
  assert.equal(rows[1].skill_name, 'portfolio');
  assert.deepEqual(listSkills([{ full_name: 'owner/unverified', has_skill_md: false, skills: [{ name: 'hidden', description: 'Hidden', path: 'SKILL.md', source_url: 'https://github.com/owner/unverified/blob/main/SKILL.md' }] }]), []);
});
