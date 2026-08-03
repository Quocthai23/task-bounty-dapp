import React from 'react';
import { Button } from '@/components/shared/atoms/button';
import { DialogHeader, DialogTitle } from '@/components/shared/atoms/dialog';

export const CreateJobForm = ({ formData, setFormData, handleCreateSubmit, isPending }: any) => {
  return (
    <>
      <div className="p-6">
        <DialogHeader className="mb-4 border-b border-neutral-100 pb-4">
          <DialogTitle className="text-2xl font-black">Create New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 flex flex-col">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Job Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 bg-neutral-50/50" placeholder="e.g. Frontend Developer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 h-24 resize-none bg-neutral-50/50" placeholder="Describe the job..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Budget (VND)</label>
              <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 bg-neutral-50/50" placeholder="e.g. 5000000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Positions</label>
              <input required type="number" min="1" value={formData.positions} onChange={e => setFormData({...formData, positions: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 bg-neutral-50/50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Skills (comma separated)</label>
            <input required value={formData.skillsRequired} onChange={e => setFormData({...formData, skillsRequired: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-primary-500 bg-neutral-50/50" placeholder="e.g. React, Node.js" />
          </div>
        </form>
      </div>
      <div className="border-t border-neutral-100 p-6 bg-neutral-50/50 mt-auto flex justify-end">
        <Button onClick={handleCreateSubmit} disabled={isPending} className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3 rounded-xl shadow-md w-full sm:w-auto">
          {isPending ? 'Creating...' : 'Create Job'}
        </Button>
      </div>
    </>
  );
};
