import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ShieldPlus, UserX } from 'lucide-react';
import AppShell from '../components/AppShell';
import { authApi } from '../api/authApi';
import useAuth from '../context/useAuth';
import './AdminAuthPage.css';

const AdminAuthPage = () => {
  const { hasAuthority } = useAuth();
  const canManageRbac = hasAuthority('rbac:manage');
  const canDeactivateUsers = hasAuthority('user:deactivate');
  const [submittingKey, setSubmittingKey] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [responsePayload, setResponsePayload] = useState(null);
  const [permissionName, setPermissionName] = useState('');
  const [roleForm, setRoleForm] = useState({ name: '', permissions: '' });
  const [rolePermissionForm, setRolePermissionForm] = useState({ roleName: '', permissionName: '' });
  const [userRoleForm, setUserRoleForm] = useState({ userId: '', roleName: '' });
  const [deactivateForm, setDeactivateForm] = useState({ userId: '', reason: '' });

  const runAction = async (key, action, successMessage) => {
    setSubmittingKey(key);
    setErrorMessage('');
    setResultMessage('');

    try {
      const payload = await action();
      setResultMessage(successMessage);
      setResponsePayload(payload);
    } catch (error) {
      setErrorMessage(error.message);
      setResponsePayload(null);
    } finally {
      setSubmittingKey('');
    }
  };

  return (
    <AppShell>
      <section className="container admin-auth-page">
        <header className="page-header">
          <div>
            <h1>Pengaturan akses admin</h1>
            <p>Atur peran, izin akses, dan status akun pengguna dari satu halaman yang sama.</p>
          </div>
          <Link to="/account" className="account-admin-link">Kembali ke Akun</Link>
        </header>

        {resultMessage ? <div className="status-banner success">{resultMessage}</div> : null}
        {errorMessage ? <div className="status-banner error">{errorMessage}</div> : null}

        <div className="admin-auth-grid">
          <div className="admin-main-column">
            {canManageRbac ? (
              <>
                <section className="surface-card">
                  <div className="section-heading">
                    <div className="section-icon"><ShieldPlus size={18} /></div>
                    <div>
                      <h2>Buat permission baru</h2>
                      <p>Tambahkan izin akses baru untuk kebutuhan fitur atau peran tertentu.</p>
                    </div>
                  </div>
                  <div className="inline-form">
                    <label className="field-label">
                      <span>Nama permission</span>
                      <input value={permissionName} onChange={(event) => setPermissionName(event.target.value)} placeholder="listing:create" />
                    </label>
                    <button
                      type="button"
                      className="primary-action"
                      disabled={!permissionName.trim() || submittingKey === 'permission'}
                      onClick={() =>
                        runAction(
                          'permission',
                          () => authApi.createPermission(permissionName.trim()),
                          'Permission baru berhasil dibuat.',
                        )
                      }
                    >
                      {submittingKey === 'permission' ? 'Menyimpan...' : 'Buat permission'}
                    </button>
                  </div>
                </section>

                <section className="surface-card">
                  <div className="section-heading">
                    <div className="section-icon"><LockKeyhole size={18} /></div>
                    <div>
                      <h2>Buat role baru</h2>
                      <p>Tentukan nama peran dan daftar izin akses awal yang ingin diberikan.</p>
                    </div>
                  </div>
                  <div className="admin-form-grid">
                    <label className="field-label">
                      <span>Nama role</span>
                      <input
                        value={roleForm.name}
                        onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="REVIEWER"
                      />
                    </label>
                    <label className="field-label field-span-2">
                      <span>Izin akses</span>
                      <input
                        value={roleForm.permissions}
                        onChange={(event) => setRoleForm((current) => ({ ...current, permissions: event.target.value }))}
                        placeholder="profile:read, profile:update"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="primary-action"
                    disabled={!roleForm.name.trim() || submittingKey === 'role'}
                    onClick={() =>
                      runAction(
                        'role',
                        () =>
                          authApi.createRole(
                            roleForm.name.trim(),
                            roleForm.permissions
                              .split(',')
                              .map((permission) => permission.trim())
                              .filter(Boolean),
                          ),
                        'Role baru berhasil dibuat.',
                      )
                    }
                  >
                    {submittingKey === 'role' ? 'Membuat role...' : 'Buat role'}
                  </button>
                </section>

                <section className="surface-card">
                  <div className="section-heading">
                    <div className="section-icon"><ShieldPlus size={18} /></div>
                    <div>
                      <h2>Assign atau revoke permission ke role</h2>
                      <p>Tambahkan atau cabut izin akses pada peran yang sudah ada.</p>
                    </div>
                  </div>
                  <div className="admin-form-grid">
                    <label className="field-label">
                      <span>Nama role</span>
                      <input
                        value={rolePermissionForm.roleName}
                        onChange={(event) => setRolePermissionForm((current) => ({ ...current, roleName: event.target.value }))}
                        placeholder="SELLER"
                      />
                    </label>
                    <label className="field-label">
                      <span>Nama permission</span>
                      <input
                        value={rolePermissionForm.permissionName}
                        onChange={(event) => setRolePermissionForm((current) => ({ ...current, permissionName: event.target.value }))}
                        placeholder="auction:create"
                      />
                    </label>
                  </div>
                  <div className="action-row">
                    <button
                      type="button"
                      className="primary-action"
                      disabled={!rolePermissionForm.roleName.trim() || !rolePermissionForm.permissionName.trim() || submittingKey === 'assign-permission'}
                      onClick={() =>
                        runAction(
                          'assign-permission',
                          () => authApi.assignPermissionToRole(rolePermissionForm.roleName.trim(), rolePermissionForm.permissionName.trim()),
                          'Permission berhasil ditambahkan ke role.',
                        )
                      }
                    >
                      {submittingKey === 'assign-permission' ? 'Menyimpan...' : 'Tambahkan permission'}
                    </button>
                    <button
                      type="button"
                      className="danger-action"
                      disabled={!rolePermissionForm.roleName.trim() || !rolePermissionForm.permissionName.trim() || submittingKey === 'revoke-permission'}
                      onClick={() =>
                        runAction(
                          'revoke-permission',
                          () => authApi.revokePermissionFromRole(rolePermissionForm.roleName.trim(), rolePermissionForm.permissionName.trim()),
                          'Permission berhasil dicabut dari role.',
                        )
                      }
                    >
                      {submittingKey === 'revoke-permission' ? 'Menghapus...' : 'Cabut permission'}
                    </button>
                  </div>
                </section>

                <section className="surface-card">
                  <div className="section-heading">
                    <div className="section-icon"><LockKeyhole size={18} /></div>
                    <div>
                      <h2>Assign atau revoke role ke user</h2>
                      <p>Tambahkan atau cabut peran pengguna sesuai kebutuhan aksesnya.</p>
                    </div>
                  </div>
                  <div className="admin-form-grid">
                    <label className="field-label">
                      <span>User ID</span>
                      <input
                        value={userRoleForm.userId}
                        onChange={(event) => setUserRoleForm((current) => ({ ...current, userId: event.target.value }))}
                        placeholder="123"
                      />
                    </label>
                    <label className="field-label">
                      <span>Nama role</span>
                      <input
                        value={userRoleForm.roleName}
                        onChange={(event) => setUserRoleForm((current) => ({ ...current, roleName: event.target.value }))}
                        placeholder="BUYER"
                      />
                    </label>
                  </div>
                  <div className="action-row">
                    <button
                      type="button"
                      className="primary-action"
                      disabled={!userRoleForm.userId.trim() || !userRoleForm.roleName.trim() || submittingKey === 'assign-role'}
                      onClick={() =>
                        runAction(
                          'assign-role',
                          () => authApi.assignRoleToUser(userRoleForm.userId.trim(), userRoleForm.roleName.trim()),
                          'Role berhasil ditambahkan ke user.',
                        )
                      }
                    >
                      {submittingKey === 'assign-role' ? 'Menyimpan...' : 'Tambahkan role'}
                    </button>
                    <button
                      type="button"
                      className="danger-action"
                      disabled={!userRoleForm.userId.trim() || !userRoleForm.roleName.trim() || submittingKey === 'revoke-role'}
                      onClick={() =>
                        runAction(
                          'revoke-role',
                          () => authApi.revokeRoleFromUser(userRoleForm.userId.trim(), userRoleForm.roleName.trim()),
                          'Role berhasil dicabut dari user.',
                        )
                      }
                    >
                      {submittingKey === 'revoke-role' ? 'Menghapus...' : 'Cabut role'}
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <div className="empty-panel">
                <h2>Pengelolaan akses tidak tersedia</h2>
                <p>Akun yang sedang digunakan belum memiliki izin untuk mengatur peran dan permission.</p>
              </div>
            )}

            {canDeactivateUsers ? (
              <section className="surface-card">
                <div className="section-heading">
                    <div className="section-icon"><UserX size={18} /></div>
                    <div>
                      <h2>Nonaktifkan pengguna</h2>
                      <p>Nonaktifkan akun pengguna dan invalidasi seluruh sesi aktifnya di semua perangkat.</p>
                    </div>
                  </div>
                <div className="admin-form-grid">
                  <label className="field-label">
                    <span>User ID</span>
                    <input
                      value={deactivateForm.userId}
                      onChange={(event) => setDeactivateForm((current) => ({ ...current, userId: event.target.value }))}
                      placeholder="123"
                    />
                  </label>
                  <label className="field-label field-span-2">
                    <span>Alasan deaktivasi</span>
                    <textarea
                      value={deactivateForm.reason}
                      onChange={(event) => setDeactivateForm((current) => ({ ...current, reason: event.target.value }))}
                      placeholder="Contoh: pelanggaran kebijakan listing"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="danger-action"
                  disabled={!deactivateForm.userId.trim() || submittingKey === 'deactivate-user'}
                  onClick={() =>
                    runAction(
                      'deactivate-user',
                      () => authApi.deactivateUser(deactivateForm.userId.trim(), deactivateForm.reason.trim()),
                      'Akun berhasil dinonaktifkan dan sesi aktifnya dicabut.',
                    )
                  }
                >
                  {submittingKey === 'deactivate-user' ? 'Memproses...' : 'Nonaktifkan pengguna'}
                </button>
              </section>
            ) : (
              <div className="empty-panel">
                <h2>Penonaktifan akun tidak tersedia</h2>
                <p>Akun yang sedang digunakan belum memiliki izin untuk menonaktifkan pengguna lain.</p>
              </div>
            )}
          </div>

          <aside className="admin-side-column">
            <section className="surface-card sticky-card">
              <div className="section-heading">
                <div className="section-icon"><LockKeyhole size={18} /></div>
                <div>
                  <h2>Hasil perubahan terakhir</h2>
                  <p>Ringkasan hasil aksi terakhir akan ditampilkan di sini.</p>
                </div>
              </div>
              <div className="response-preview">
                {responsePayload ? (
                  <pre>{JSON.stringify(responsePayload, null, 2)}</pre>
                ) : (
                  <p>Belum ada hasil perubahan yang ditampilkan.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
  );
};

export default AdminAuthPage;
