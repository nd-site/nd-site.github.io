import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from '../../components/Navbar';
import { AdminEduApp } from './AdminEduApp';
import { TeacherEduApp } from './TeacherEduApp';
import { TeacherHubApp } from './TeacherHubApp';
import { StudentExamApp } from './StudentExamApp';
import { EduPortalApp } from './EduPortalApp';
import { ClassEduApp } from './ClassEduApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  const path = window.location.pathname.toLowerCase();
  const dataMode = container.getAttribute('data-mode');

  let AppToRender = EduPortalApp;

  if (dataMode === 'portal') {
    AppToRender = EduPortalApp;
  } else if (dataMode === 'exam') {
    AppToRender = StudentExamApp;
  } else if (dataMode === 'teacher-hub') {
    AppToRender = TeacherHubApp;
  } else if (dataMode === 'teacher') {
    AppToRender = TeacherEduApp;
  } else if (dataMode === 'teacher-class') {
    AppToRender = () => <ClassEduApp isTeacherMode={true} />;
  } else if (dataMode === 'admin') {
    AppToRender = AdminEduApp;
  } else if (dataMode === 'class') {
    AppToRender = () => <ClassEduApp isTeacherMode={false} />;
  } else if (path.includes('/edu/exam')) {
    AppToRender = StudentExamApp;
  } else if (path.includes('/edu/teacher/class')) {
    AppToRender = () => <ClassEduApp isTeacherMode={true} />;
  } else if (path.includes('/edu/teacher/exam')) {
    AppToRender = TeacherEduApp;
  } else if (path.includes('/edu/teacher')) {
    AppToRender = TeacherHubApp;
  } else if (path.includes('/edu/class')) {
    AppToRender = () => <ClassEduApp isTeacherMode={false} />;
  } else if (path.includes('/admin/edu')) {
    AppToRender = AdminEduApp;
  } else if (path.includes('/edu')) {
    AppToRender = EduPortalApp;
  }

  root.render(
    <React.StrictMode>
      <Navbar />
      <AppToRender />
    </React.StrictMode>
  );
}
