// client/src/domain/tip/pages/FitnessTipManagePage.jsx
import React, { useState, useEffect } from 'react';
import {
    fetchAllTips,
    createTip,
    updateTip,
    deleteTip,
    toggleTipStatus
} from '../api/fitnessTipApi';
import useCustomLogin from '../../member/login/hooks/useCustomLogin';
import BasicLayout from '../../../layouts/BasicLayout';

const FitnessTipManagePage = () => {
    const { loginState } = useCustomLogin();
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTip, setEditingTip] = useState(null);
    const [formData, setFormData] = useState({
        content: '',
        isActive: true
    });

    // 권한 체크
    const isAdmin = loginState?.roleNames?.some(role =>
        role === 'ADMIN' || role === 'MANAGER'
    );

    useEffect(() => {
        if (!isAdmin) {
            setError('접근 권한이 없습니다.');
            setLoading(false);
            return;
        }
        loadTips();
    }, [isAdmin]);

    const loadTips = async () => {
        try {
            setLoading(true);
            const data = await fetchAllTips();
            setTips(data);
        } catch (err) {
            console.error('팁 목록 로딩 실패:', err);
            setError('팁 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tipData = {
                content: formData.content,
                isActive: formData.isActive,
                createdBy: loginState.email,
                modifiedBy: loginState.email
            };

            if (editingTip) {
                await updateTip(editingTip.tipNo, tipData);
            } else {
                await createTip(tipData);
            }

            await loadTips();
            resetForm();
        } catch (err) {
            console.error('팁 저장 실패:', err);
            alert('팁 저장에 실패했습니다.');
        }
    };

    const handleEdit = (tip) => {
        setEditingTip(tip);
        setFormData({
            content: tip.content,
            isActive: tip.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (tipNo) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteTip(tipNo);
            await loadTips();
        } catch (err) {
            console.error('팁 삭제 실패:', err);
            alert('팁 삭제에 실패했습니다.');
        }
    };

    const handleToggleStatus = async (tipNo) => {
        try {
            await toggleTipStatus(tipNo, loginState.email);
            await loadTips();
        } catch (err) {
            console.error('상태 변경 실패:', err);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const resetForm = () => {
        setFormData({ content: '', isActive: true });
        setEditingTip(null);
        setShowForm(false);
    };

    if (!isAdmin) {
        return (
            <BasicLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-600">
                        접근 권한이 없습니다.
                    </div>
                </div>
            </BasicLayout>
        );
    }

    if (loading) {
        return (
            <BasicLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">로딩 중...</div>
                </div>
            </BasicLayout>
        );
    }

    return (
        <BasicLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">💡 운동 팁 관리</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {showForm ? '취소' : '새 팁 추가'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* 폼 영역 */}
                    {showForm && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingTip ? '팁 수정' : '새 팁 추가'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        팁 내용
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="운동 팁을 입력하세요..."
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">
                                        활성화
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        {editingTip ? '수정' : '생성'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* 팁 목록 */}
                    <div className="space-y-4">
                        {tips.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                등록된 팁이 없습니다.
                            </div>
                        ) : (
                            tips.map((tip) => (
                                <div
                                    key={tip.tipNo}
                                    className={`border rounded-lg p-4 ${tip.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tip.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {tip.isActive ? '활성' : '비활성'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    #{tip.tipNo}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 mb-2">{tip.content}</p>
                                            <div className="text-xs text-gray-500">
                                                생성: {tip.createdBy} | {new Date(tip.createdDate).toLocaleDateString()}
                                                {tip.modifiedDate && (
                                                    <span> | 수정: {tip.modifiedBy} | {new Date(tip.modifiedDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(tip)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(tip.tipNo)}
                                                className={`px-3 py-1 rounded text-sm transition-colors ${tip.isActive
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                                    }`}
                                            >
                                                {tip.isActive ? '비활성화' : '활성화'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tip.tipNo)}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </BasicLayout>
    );
};

export default FitnessTipManagePage;