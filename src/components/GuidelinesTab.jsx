// src/components/GuidelinesTab.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Star, Scale, Heart, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const GuidelinesTab = () => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guidelinesData, setGuidelinesData] = useState({
    guidelines: [
      {
        id: 1,
        title: "যাদের এখনও তিন মাস অতিক্রম হয়নি অর্থাৎ \"Not eligible\" দেখায় তাদের সাথে যোগাযোগ করতে পারবেন না।",
        description: "রক্তদানের জন্য প্রয়োজনীয় সময়সীমা অতিক্রান্ত হওয়া আবশ্যক"
      },
      {
        id: 2,
        title: "রক্তদানের পর নিজের প্রোফাইল আপডেট করে \"Last Donation Date\" অবশ্যই চেঞ্জ করে দিন।",
        description: "নিয়মিত প্রোফাইল আপডেট করা প্রতিটি রক্তদাতার দায়িত্ব"
      }
    ],
    virtues: [
      {
        id: 1,
        content: "আল্লাহ তাআলা বলেন, '...আর কেউ কারো প্রাণ রক্ষা করলে সে যেন সকল মানুষের প্রাণ রক্ষা করল...'",
        reference: "(সূরা মা'ইদাহ: ৩২)"
      },
      {
        id: 2,
        content: "রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেছেনঃ 'যে লোক কোন মু'মিন ব্যক্তির দুনিয়াবী অসুবিধাগুলোর কোন একটি অসুবিধা দূর করে দেয়, তার পরকালের অসুবিধাগুলোর মধ্যে একটি অসুবিধা আল্লাহ তা'আলা দূর করে দিবেন। কোন মুসলিম ব্যক্তির দোষ-ত্রুটি যে লোক গোপন রাখে, তার দোষ-ত্রুটি আল্লাহ তা'আলা দুনিয়া ও আখিরাতে গোপন রাখেন। যে পর্যন্ত বান্দাহ তার ভাইকে সাহায্য করতে থাকে সে পর্যন্ত আল্লাহ তা'আলাও তাকে সাহায্য করতে থাকেন।'",
        reference: "(সুনান আত তিরমিজী: ১৪২৫, সহীহ হাদীস)"
      }
    ],
    ruling: {
      question: "প্রশ্ন: রক্ত দান করা কি শরী'আতসম্মত? এটা 'ছাদাক্বা'র অন্তর্ভুক্ত হবে কি?",
      answer: "উত্তর: \"অসুস্থ ব্যক্তির প্রয়োজনে রক্ত দান করায় কোন বাধা নেই। বরং মানুষের জীবন বাঁচানোর স্বার্থে এরূপ সাহায্য করা নিঃসন্দেহে নেকীর কাজ। রাসূলুল্লাহ (ছাঃ) বলেন, 'এক মুসলমান অপর মুসলমানের ভাই। যে ব্যক্তি তার কোন ভাইয়ের সাহায্যে এগিয়ে আসে, আল্লাহ তা'আলা তার সাহায্যে এগিয়ে আসেন। যে ব্যক্তি দুনিয়াতে তার ভাইয়ের কোন কষ্ট দূর করবে, আল্লাহ তা'আলাও ক্বিয়ামতের দিন তার একটি কষ্ট দূর করবেন' (বুখারী হা/২৪৪২; মুসলিম হা/২৫৮০; মিশকাত হা/৪৯৫৮ 'শিষ্টাচার' অধ্যায়, 'সৃষ্টির প্রতি দয়া' অনুচ্ছেদ)। তিনি বলেন, (নেকীর উদ্দেশ্যে কৃত) প্রত্যেক সৎকর্মই ছাদাক্বা (বুখারী, মুসলিম; মিশকাত হা/১৮৯৩)। অতএব এটিও ছাদাক্বার অন্তর্ভুক্ত হবে।\"",
      reference: "(মাসিক আত তাহরীক: প্রশ্ন নং ১০/১৭০, ফেব্রুয়ারি ২০১৫)"
    }
  });

  useEffect(() => {
    fetchGuidelinesData();
  }, []);

  const fetchGuidelinesData = async () => {
    try {
      const { data, error } = await supabase
        .from('guidelines_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching guidelines:', error);
        return;
      }

      if (data && data.content) {
        setGuidelinesData(data.content);
      }
    } catch (error) {
      console.error('Error in fetchGuidelinesData:', error);
    }
  };

  const saveGuidelinesData = async () => {
    setLoading(true);
    try {
      const { data: existingData } = await supabase
        .from('guidelines_content')
        .select('id')
        .single();

      let error;

      if (existingData?.id) {
        const { error: updateError } = await supabase
          .from('guidelines_content')
          .update({ content: guidelinesData })
          .eq('id', existingData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('guidelines_content')
          .insert([{ content: guidelinesData }]);
        error = insertError;
      }

      if (error) throw error;

      setIsEditing(false);
      alert('Guidelines updated successfully!');
    } catch (error) {
      console.error('Error saving guidelines:', error);
      alert('Failed to update guidelines: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuidelineChange = (index, field, value) => {
    const updatedGuidelines = [...guidelinesData.guidelines];
    updatedGuidelines[index][field] = value;
    setGuidelinesData(prev => ({
      ...prev,
      guidelines: updatedGuidelines
    }));
  };

  const handleVirtueChange = (index, field, value) => {
    const updatedVirtues = [...guidelinesData.virtues];
    updatedVirtues[index][field] = value;
    setGuidelinesData(prev => ({
      ...prev,
      virtues: updatedVirtues
    }));
  };

  const handleRulingChange = (field, value) => {
    setGuidelinesData(prev => ({
      ...prev,
      ruling: {
        ...prev.ruling,
        [field]: value
      }
    }));
  };

  // CSS styles for section titles
  const sectionTitleStyle = {
    position: 'relative',
    paddingBottom: '10px'
  };

  const sectionTitleAfterStyle = {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '60px',
    height: '3px',
    borderRadius: '3px'
  };

  return (
    <div className="space-y-8">
      {/* হেডিং যোগ করা হয়েছে এখানে */}
      <div className=" p-6">
        <h1 className="text-3xl font-bold text-center mb-2 bangla">রক্তদান নির্দেশিকা ও ইসলামিক দৃষ্টিভঙ্গি</h1>
        <p className="text-gray-600 text-center mb-8 bangla">মানবতার সেবায় রক্তদান - ইসলামিক দৃষ্টিকোণ</p>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex justify-end gap-4 mb-6">
          {isEditing ? (
            <>
              <button
                onClick={saveGuidelinesData}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-outline flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Content
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Guidelines Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div style={sectionTitleStyle} className="bangla">
              <h2 className="text-2xl font-bold text-red-700">
                গুরুত্বপূর্ণ দিকনির্দেশনা
              </h2>
              <div style={{...sectionTitleAfterStyle, background: 'linear-gradient(to right, #ef4444, #b91c1c)'}}></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {guidelinesData.guidelines.map((guideline, index) => (
              <div key={guideline.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={guideline.title}
                        onChange={(e) => handleGuidelineChange(index, 'title', e.target.value)}
                        className="w-full form-input mb-2 bangla"
                        placeholder="Guideline title"
                      />
                      <input
                        type="text"
                        value={guideline.description}
                        onChange={(e) => handleGuidelineChange(index, 'description', e.target.value)}
                        className="w-full form-input text-sm bangla"
                        placeholder="Guideline description"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-800 bangla">{guideline.title}</h3>
                      <p className="text-gray-600 text-sm mt-2 bangla">{guideline.description}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Islamic Ruling Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-900" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 bangla">রক্তদানের বিধান</h2>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              {isEditing ? (
                <>
                  <textarea
                    value={guidelinesData.ruling.question}
                    onChange={(e) => handleRulingChange('question', e.target.value)}
                    className="w-full form-input mb-3 bangla"
                    rows="2"
                    placeholder="Question"
                  />
                  <textarea
                    value={guidelinesData.ruling.answer}
                    onChange={(e) => handleRulingChange('answer', e.target.value)}
                    className="w-full form-input mb-3 bangla"
                    rows="4"
                    placeholder="Answer"
                  />
                  <input
                    type="text"
                    value={guidelinesData.ruling.reference}
                    onChange={(e) => handleRulingChange('reference', e.target.value)}
                    className="w-full form-input text-sm bangla"
                    placeholder="Reference"
                  />
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-800 bangla mb-2">{guidelinesData.ruling.question}</h3>
                  <p className="text-gray-700 text-m bangla mb-3">{guidelinesData.ruling.answer}</p>
                  <p className="text-gray-600 text-xs bangla">{guidelinesData.ruling.reference}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Virtues Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div style={sectionTitleStyle} className="bangla">
              <h2 className="text-2xl font-bold text-[#078f66]">
                রক্তদানের ফযীলত
              </h2>
              <div style={{...sectionTitleAfterStyle, background: 'linear-gradient(to right, #059f71, #078f66)'}}></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {guidelinesData.virtues.map((virtue, index) => (
              <div key={virtue.id} className="bg-green-50 p-4 rounded-lg">
                {isEditing ? (
                  <>
                    <textarea
                      value={virtue.content}
                      onChange={(e) => handleVirtueChange(index, 'content', e.target.value)}
                      className="w-full form-input mb-2 bangla"
                      rows="3"
                      placeholder="Virtue content"
                    />
                    <input
                      type="text"
                      value={virtue.reference}
                      onChange={(e) => handleVirtueChange(index, 'reference', e.target.value)}
                      className="w-full form-input text-sm bangla"
                      placeholder="Reference"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 bangla">{virtue.content}</p>
                    <p className="text-gray-600 text-sm mt-2 bangla">{virtue.reference}</p>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-bold text-red-700 bangla mb-2 text-center">রক্তদান করুন, জীবন বাঁচান</h3>
              <p className="text-gray-700 bangla text-sm text-center">এক ব্যাগ রক্ত একটি জীবন বাঁচাতে পারে। আপনার রক্তদান আজ কাউকে বাঁচাতে পারে</p>
              <div className="flex justify-center mt-4">
                <button className="btn-primary bangla">
                  <Heart className="w-4 h-4" />
                  রক্তদাতা হোন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-center text-gray-600 bangla">রক্তদান মহান ইবাদত - মানবতার সেবায় এগিয়ে আসুন</p>
      </div>
    </div>
  );
};

export default GuidelinesTab;