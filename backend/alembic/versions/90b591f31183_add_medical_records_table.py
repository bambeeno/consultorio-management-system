"""add medical records table

Revision ID: 90b591f31183
Revises: 0522e364ee15
Create Date: 2026-03-13 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '90b591f31183'
down_revision: Union[str, None] = '0522e364ee15'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear tabla medical_records
    op.create_table('medical_records',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('consultorio_id', sa.Integer(), nullable=False),
    sa.Column('patient_id', sa.Integer(), nullable=False),
    sa.Column('appointment_id', sa.Integer(), nullable=True),
    sa.Column('doctor_id', sa.Integer(), nullable=False),
    sa.Column('consultation_date', sa.DateTime(timezone=True), nullable=False),
    sa.Column('chief_complaint', sa.String(length=500), nullable=True),
    sa.Column('symptoms', sa.Text(), nullable=True),
    sa.Column('diagnosis', sa.Text(), nullable=False),
    sa.Column('treatment', sa.Text(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('blood_pressure', sa.String(length=20), nullable=True),
    sa.Column('heart_rate', sa.Integer(), nullable=True),
    sa.Column('temperature', sa.Float(), nullable=True),
    sa.Column('weight', sa.Float(), nullable=True),
    sa.Column('height', sa.Float(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ),
    sa.ForeignKeyConstraint(['consultorio_id'], ['consultorios.id'], ),
    sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_medical_records_consultation_date'), 'medical_records', ['consultation_date'], unique=False)
    op.create_index(op.f('ix_medical_records_consultorio_id'), 'medical_records', ['consultorio_id'], unique=False)
    op.create_index(op.f('ix_medical_records_id'), 'medical_records', ['id'], unique=False)
    op.create_index(op.f('ix_medical_records_patient_id'), 'medical_records', ['patient_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_medical_records_patient_id'), table_name='medical_records')
    op.drop_index(op.f('ix_medical_records_id'), table_name='medical_records')
    op.drop_index(op.f('ix_medical_records_consultorio_id'), table_name='medical_records')
    op.drop_index(op.f('ix_medical_records_consultation_date'), table_name='medical_records')
    op.drop_table('medical_records')
